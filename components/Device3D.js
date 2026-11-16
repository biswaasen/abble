'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { drawScreen, AGENT_KEYS } from '@/components/screens';
import { LOGO_PATH } from '@/components/Logo';

const STATES = [{ k: 'idle' }, { k: 'ask' }, { k: 'talk', live: true }, { k: 'sent' }];

const W = 3.8, H = 2.8, D = 0.5, RAD = 0.3, RB = 0.05, GB = 0.05, INS = 0.035;
const ZG = D / 2 - 0.06;
const DW = W - 2 * INS, DH = H - 2 * INS;
const FV = (24 * Math.PI) / 360;
const FIT = 0.92;
const BLEED = 0.25, K = 1 + 2 * BLEED;

function buildDevice(R) {
  const V2 = THREE.Vector2;
  const scene = new THREE.Scene();

  const pm = new THREE.PMREMGenerator(R);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x242424, side: THREE.BackSide })));
  const panel = (w, h, x, y, z, s) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(s), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  panel(14, 14, 0, 13, 2, 4); panel(3, 18, -12, 2, 4, 6); panel(3, 18, 12, 2, -2, 5); panel(18, 4, 0, -4, 13, 1.6);
  panel(10, 10, 0, 4, -13, 1.2); panel(2, 10, -6, 0, 11, 1.8); panel(2, 10, 9, 1, 7, 2.4); panel(20, 1.2, 0, 7, 9, 3.2);
  const envTex = pm.fromScene(env, 0.03).texture;
  scene.environment = envTex;
  pm.dispose();

  const gc = document.createElement('canvas'); gc.width = gc.height = 512;
  const gx = gc.getContext('2d'); const im = gx.createImageData(512, 512);
  for (let i = 0; i < im.data.length; i += 4) { const v = 200 + Math.random() * 55; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  gx.putImageData(im, 0, 0);
  const grain = new THREE.CanvasTexture(gc); grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(3, 3);

  const alu = new THREE.MeshPhysicalMaterial({ color: 0x5a5c61, metalness: 1, roughness: 0.4, roughnessMap: grain, bumpMap: grain, bumpScale: 0.0006 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0, roughness: 0.06, reflectivity: 0.3, envMapIntensity: 0.38 });
  const antM = new THREE.MeshStandardMaterial({ color: 0x2e2f32, roughness: 0.7, metalness: 0.1 });
  const wellM = new THREE.MeshStandardMaterial({ color: 0x0a0a0b, roughness: 0.85, side: THREE.DoubleSide });

  const M = (g, m, x, y, z, par) => { const o = new THREE.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); par.add(o); return o; };
  const pivot = new THREE.Group(); pivot.rotation.order = 'YXZ'; scene.add(pivot);
  const dev = new THREE.Group(); pivot.add(dev);

  function perim(w, h, rc, seg) {
    const pts = [], x = w / 2 - rc, y = h / 2 - rc;
    const arc = (cx, cy, a0) => { for (let i = 0; i <= seg; i++) { const a = a0 + (Math.PI / 2) * i / seg; pts.push({ x: cx + rc * Math.cos(a), y: cy + rc * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) }); } };
    arc(x, y, 0); arc(-x, y, Math.PI / 2); arc(-x, -y, Math.PI); arc(x, -y, 1.5 * Math.PI);
    let L = 0; pts.forEach((p, i) => { if (i) L += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y); p.s = L; });
    return pts;
  }
  function sweep(P, prof) {
    const pos = [], nor = [], uv = [], idx = [], np = P.length, nq = prof.length;
    P.forEach((p) => prof.forEach((q) => { pos.push(p.x - p.nx * q.t, p.y - p.ny * q.t, q.z); nor.push(p.nx * q.nr, p.ny * q.nr, q.nz); uv.push(p.s, q.z); }));
    for (let i = 0; i < np; i++) { const i2 = (i + 1) % np; for (let j = 0; j < nq - 1; j++) { const a = i * nq + j, b = i2 * nq + j, c = i2 * nq + j + 1, d = i * nq + j + 1; idx.push(a, b, d, b, c, d); } }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); return g;
  }
  function rshape(w, h, r) {
    const s = new THREE.Shape(), x = w / 2, y = h / 2; r = Math.max(r, 0.004);
    s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false); s.lineTo(x, y - r);
    s.absarc(x - r, y - r, r, 0, Math.PI / 2, false); s.lineTo(-x + r, y); s.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(-x, -y + r); s.absarc(-x + r, -y + r, r, Math.PI, 1.5 * Math.PI, false); return s;
  }
  const PER = perim(W, H, RAD, 20);
  const fprof = [];
  for (let k = 0; k <= 14; k++) { const f = (Math.PI / 2) * k / 14; fprof.push({ t: RB - RB * Math.sin(f), z: -D / 2 + RB - RB * Math.cos(f), nr: Math.sin(f), nz: -Math.cos(f) }); }
  [0.25, 0.5, 0.75, 1].forEach((a) => fprof.push({ t: 0, z: (-D / 2 + RB) + a * (ZG - (-D / 2 + RB)), nr: 1, nz: 0 }));
  M(sweep(PER, fprof), alu, 0, 0, 0, dev);
  const back = M(new THREE.ShapeGeometry(rshape(W - 2 * RB, H - 2 * RB, RAD - RB), 12), alu, 0, 0, -D / 2, dev); back.rotation.y = Math.PI;
  const gprof = [{ t: 0, z: ZG, nr: 1, nz: 0 }, { t: 0, z: D / 2 - GB, nr: 1, nz: 0 }];
  for (let k = 1; k <= 10; k++) { const f = (Math.PI / 2) * k / 10; gprof.push({ t: GB - GB * Math.cos(f), z: D / 2 - GB + GB * Math.sin(f), nr: Math.cos(f), nz: Math.sin(f) }); }
  M(sweep(PER, gprof), glass, 0, 0, 0, dev);
  M(new THREE.ShapeGeometry(rshape(W - 2 * GB, H - 2 * GB, RAD - GB), 12), glass, 0, 0, D / 2, dev);

  const sideZ = (ZG + (-D / 2 + RB)) / 2;
  [[-1.5, 1], [1.5, 1], [-1.5, -1], [1.5, -1]].forEach(([x, sgn]) => {
    const a = M(new THREE.PlaneGeometry(0.035, ZG - (-D / 2 + RB) - 0.02), antM, x, sgn * (H / 2 + 0.0015), sideZ, dev);
    a.rotation.x = sgn > 0 ? -Math.PI / 2 : Math.PI / 2;
  });
  const mic = M(new THREE.CircleGeometry(0.022, 24), wellM, -1.05, H / 2 + 0.002, sideZ, dev); mic.rotation.x = -Math.PI / 2;

  const aniso = R.capabilities.getMaxAnisotropy();
  const sc = document.createElement('canvas'); sc.width = 2048; sc.height = Math.round(2048 * DH / DW);
  const tex = new THREE.CanvasTexture(sc); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = aniso;
  M(new THREE.PlaneGeometry(DW, DH), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), 0, 0, D / 2 + 0.0012, dev);
  const glc = document.createElement('canvas'); glc.width = 512; glc.height = 384;
  const glx = glc.getContext('2d'); const gg = glx.createLinearGradient(0, 0, 512, 384);
  gg.addColorStop(0, 'rgba(255,255,255,0.07)'); gg.addColorStop(0.3, 'rgba(255,255,255,0.015)'); gg.addColorStop(0.5, 'rgba(255,255,255,0)');
  glx.fillStyle = gg; glx.fillRect(0, 0, 512, 384);
  const glt = new THREE.CanvasTexture(glc); glt.encoding = THREE.sRGBEncoding;
  M(new THREE.PlaneGeometry(W - 2 * GB, H - 2 * GB), new THREE.MeshBasicMaterial({ map: glt, transparent: true, depthWrite: false, toneMapped: false }), 0, 0, D / 2 + 0.0025, dev);

  const wc = document.createElement('canvas'); wc.width = 1024; wc.height = 512;
  const wx = wc.getContext('2d'), ms = 230 / 100;
  wx.fillStyle = 'rgba(255,255,255,0.34)';
  wx.setTransform(ms, 0, 0, ms, 512 - 50 * ms, 256 - 50 * ms);
  wx.fill(new Path2D(LOGO_PATH));
  const wt = new THREE.CanvasTexture(wc); wt.encoding = THREE.sRGBEncoding; wt.anisotropy = aniso;
  const wm = M(new THREE.PlaneGeometry(2.0, 1.0), new THREE.MeshBasicMaterial({ map: wt, transparent: true, toneMapped: false, depthWrite: false }), 0, 0, -D / 2 - 0.0015, dev);
  wm.rotation.y = Math.PI;

  const stadium = (w, h) => rshape(w, h, h / 2);
  const ringShape = stadium(0.93, 0.36); ringShape.holes.push(stadium(0.894, 0.326));
  const ur = M(new THREE.ShapeGeometry(ringShape, 16), new THREE.MeshPhysicalMaterial({ color: 0x8d8f94, metalness: 1, roughness: 0.12 }), 0, -H / 2 - 0.0016, sideZ, dev); ur.rotation.x = Math.PI / 2;
  const uw = M(new THREE.ShapeGeometry(stadium(0.894, 0.326), 16), new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 0.9 }), 0, -H / 2 - 0.0014, sideZ, dev); uw.rotation.x = Math.PI / 2;
  const ut = M(new THREE.ShapeGeometry(rshape(0.66, 0.07, 0.02), 4), new THREE.MeshStandardMaterial({ color: 0x232325, roughness: 0.6 }), 0, -H / 2 - 0.0018, sideZ, dev); ut.rotation.x = Math.PI / 2;

  const shc = document.createElement('canvas'); shc.width = shc.height = 256;
  const sx = shc.getContext('2d'); const gr = sx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,0.30)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  sx.fillStyle = gr; sx.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shc), transparent: true, depthWrite: false, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -H / 2 - 0.12, 0); shadow.scale.set(6.6, 1.8, 1); scene.add(shadow);

  return { scene, pivot, sc, tex, envTex };
}

export const SCREEN = Object.fromEntries(STATES.map((s, i) => [s.k, i]));

export default function Device3D({ drive, className = '' }) {
  const stageRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl') || probe.getContext('experimental-webgl'))) { setFallback(true); return; }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let R;
    try {
      R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch { setFallback(true); return; }
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.toneMappingExposure = 1.12;
    R.setClearColor(0, 0);
    R.domElement.setAttribute('aria-hidden', 'true');
    Object.assign(R.domElement.style, { inset: `${-BLEED * 100}%`, width: `${K * 100}%`, height: `${K * 100}%` });
    stage.appendChild(R.domElement);

    const cam = new THREE.PerspectiveCamera((2 * Math.atan(K * Math.tan(FV)) * 180) / Math.PI, 1, 0.3, 200);
    const { scene, pivot, sc, tex, envTex } = buildDevice(R);

    const icons = {};
    const layers = {};
    const sx = sc.getContext('2d');
    const shown = { idx: drive.current.idx, prev: drive.current.idx, at: 0 };
    let lastPaint = -1;
    const renderLayer = (k, t = 0) => {
      let cv = layers[k];
      if (!cv) { cv = layers[k] = document.createElement('canvas'); cv.width = sc.width; cv.height = sc.height; }
      drawScreen(cv.getContext('2d'), k, cv.width, cv.height, t, icons);
    };
    const renderAll = () => { STATES.forEach((s) => renderLayer(s.k)); lastPaint = -1; };
    const rr = ((RAD - INS) / DW) * sc.width;
    const clip = () => {
      const w = sc.width, h = sc.height, r = rr;
      sx.beginPath(); sx.moveTo(r, 0); sx.arcTo(w, 0, w, h, r); sx.arcTo(w, h, 0, h, r); sx.arcTo(0, h, 0, 0, r); sx.arcTo(0, 0, w, 0, r); sx.closePath();
    };
    const layer = (k, a) => {
      if (!layers[k] || a <= 0) return;
      sx.globalAlpha = a; sx.drawImage(layers[k], 0, 0); sx.globalAlpha = 1;
    };
    const paint = (now) => {
      const k = Math.min(1, (now - shown.at) / 420);
      const live = STATES[shown.idx].live || (k < 1 && STATES[shown.prev].live);
      const key = shown.idx * 1000 + Math.round(k * 100) + (live ? Math.floor(now / 50) * 1e4 : 0);
      if (key === lastPaint) return;
      lastPaint = key;
      if (live) renderLayer('talk', now / 1000);
      sx.clearRect(0, 0, sc.width, sc.height); sx.save(); clip(); sx.clip();
      sx.fillStyle = '#000'; sx.fillRect(0, 0, sc.width, sc.height);
      if (k < 1) layer(STATES[shown.prev].k, 1);
      layer(STATES[shown.idx].k, k < 1 ? k * k * (3 - 2 * k) : 1);
      sx.restore(); tex.needsUpdate = true;
    };
    renderAll();
    AGENT_KEYS.forEach((k) => {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => { icons[k] = im; renderAll(); };
      im.src = `/brand/${k}.png`;
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderAll).catch(() => {});

    let uy = 0, ux = 0, drag = false, lx = 0, ly = 0, t = 0, letGo = 0;
    const down = (e) => { drag = true; lx = e.clientX; ly = e.clientY; stage.style.cursor = 'grabbing'; };
    const move = (e) => {
      if (!drag) return;
      uy += (e.clientX - lx) * 0.01; ux = Math.max(-0.45, Math.min(0.45, ux + (e.clientY - ly) * 0.005));
      lx = e.clientX; ly = e.clientY;
    };
    const up = () => {
      if (!drag) return;
      drag = false; stage.style.cursor = ''; letGo = performance.now();
      const turns = Math.round(uy / (2 * Math.PI)) * 2 * Math.PI;
      uy -= turns; pivot.rotation.y -= turns;
    };
    stage.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);

    let baseD = 6;
    const size = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      R.setSize(w * K, h * K, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      const needH = (H / 2) / Math.tan(FV) * 1.42 * FIT, needW = (W / 2) / (Math.tan(FV) * cam.aspect) * 1.36 * FIT;
      baseD = Math.max(needH, needW);
    };
    const ro = new ResizeObserver(size); ro.observe(stage); size();

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' });
    io.observe(stage);

    pivot.rotation.y = drive.current.ry;
    pivot.rotation.x = drive.current.rx;
    const clock = new THREE.Clock();
    let raf = 0, started = false;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible) return;
      const P = drive.current, sw = reduce ? 0 : P.sway || 0, now = performance.now();
      if (P.idx !== shown.idx) { shown.prev = shown.idx; shown.idx = P.idx; shown.at = now; }
      if (!drag && !reduce) t += dt;
      if (!drag && now - letGo > 1400) { const d = Math.exp(-dt * 2.4); uy *= d; ux *= d; }
      const ry = P.ry + uy + Math.sin(t * 0.45) * 0.22 * sw;
      const rx = P.rx + ux + Math.sin(t * 0.31) * 0.03 * sw;
      const k = Math.min(1, dt * 18);
      pivot.rotation.y += (ry - pivot.rotation.y) * k;
      pivot.rotation.x += (rx - pivot.rotation.x) * k;
      cam.position.set(0, baseD * 0.1, baseD); cam.lookAt(0, -0.05, 0);
      paint(now);
      R.render(scene, cam);
      if (!started) { started = true; setReady(true); }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      stage.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
      });
      envTex.dispose(); R.dispose();
      if (R.domElement.parentNode) R.domElement.parentNode.removeChild(R.domElement);
    };
  }, [drive]);

  return (
    <div ref={stageRef} className={`stage ${className}${ready ? ' ready' : ''}${fallback ? ' fallback' : ''}`}>
      <img className="poster" src="/img/hero.webp" width={1536} height={1024} alt="abble 1, a small space gray device showing the time and four coding agents" />
    </div>
  );
}
