'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LOGO_PATH } from '@/components/Logo';
// Screen images live in public/screens (2048 × 1500 renders of the device screens), in story order.
export const SCREENS = ['home', 'ask', 'talk', 'done'];

const W = 3.8, H = 2.8, D = 0.4, RAD = 0.3, RB = 0.05, GB = 0.05, INS = 0.035;
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
  const sbc = document.createElement('canvas'); sbc.width = sbc.height = 256;
  const sbx = sbc.getContext('2d'), sbg = sbx.createRadialGradient(128, 128, 0, 128, 128, 128);
  sbg.addColorStop(0, '#fff'); sbg.addColorStop(0.55, '#777'); sbg.addColorStop(1, '#000');
  sbx.fillStyle = sbg; sbx.fillRect(0, 0, 256, 256);
  const softbox = new THREE.Mesh(new THREE.PlaneGeometry(16, 11), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sbc), color: new THREE.Color(1, 1, 1).multiplyScalar(0.9), side: THREE.DoubleSide }));
  softbox.position.set(-5, 6, 12); softbox.lookAt(0, 0, 0);
  const envTex = pm.fromScene(env, 0.03).texture;
  env.add(softbox);
  const glassEnv = pm.fromScene(env, 0.03).texture;
  scene.environment = envTex;
  pm.dispose();

  const gc = document.createElement('canvas'); gc.width = gc.height = 512;
  const gx = gc.getContext('2d'); const im = gx.createImageData(512, 512);
  for (let i = 0; i < im.data.length; i += 4) { const v = 200 + Math.random() * 55; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  gx.putImageData(im, 0, 0);
  const grain = new THREE.CanvasTexture(gc); grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(3, 3);

  const alu = new THREE.MeshPhysicalMaterial({ color: 0x5a5c61, metalness: 1, roughness: 0.4, roughnessMap: grain, bumpMap: grain, bumpScale: 0.0006 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0, roughness: 0.05, reflectivity: 0.4, envMap: glassEnv, envMapIntensity: 0.8 });
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
  // Two stacked screen planes: `base` holds the current screen, `top` fades the next one in over it.
  const screenGeo = new THREE.PlaneGeometry(DW, DH);
  const screenMat = () => new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const base = M(screenGeo, screenMat(), 0, 0, D / 2 + 0.0012, dev);
  const top = M(screenGeo, screenMat(), 0, 0, D / 2 + 0.0016, dev);
  base.renderOrder = 1; top.renderOrder = 2; base.visible = top.visible = false;
  const glc = document.createElement('canvas'); glc.width = 512; glc.height = 384;
  const glx = glc.getContext('2d'); const gg = glx.createLinearGradient(0, 0, 512, 384);
  gg.addColorStop(0, 'rgba(255,255,255,0.07)'); gg.addColorStop(0.28, 'rgba(255,255,255,0.02)'); gg.addColorStop(0.55, 'rgba(255,255,255,0)');
  glx.fillStyle = gg; glx.fillRect(0, 0, 512, 384);
  const glt = new THREE.CanvasTexture(glc); glt.encoding = THREE.sRGBEncoding;
  M(new THREE.PlaneGeometry(W - 2 * GB, H - 2 * GB), new THREE.MeshBasicMaterial({ map: glt, transparent: true, depthWrite: false, toneMapped: false }), 0, 0, D / 2 + 0.0025, dev);

  const wc = document.createElement('canvas'); wc.width = 1024; wc.height = 512;
  const wx = wc.getContext('2d'), ms = 230 / 100;
  wx.fillStyle = 'rgba(255,255,255,0.34)';
  wx.setTransform(ms, 0, 0, ms, 512 - 50 * ms, 256 - 50 * ms);
  wx.fill(new Path2D(LOGO_PATH));
  const wt = new THREE.CanvasTexture(wc); wt.encoding = THREE.sRGBEncoding; wt.anisotropy = aniso;
  const wm = M(new THREE.PlaneGeometry(1.7, 0.85), new THREE.MeshBasicMaterial({ map: wt, transparent: true, toneMapped: false, depthWrite: false }), 0, 0, -D / 2 - 0.0015, dev);
  wm.rotation.y = Math.PI;

  const stadium = (w, h) => rshape(w, h, h / 2);
  const ringShape = stadium(0.744, 0.26); ringShape.holes.push(stadium(0.71, 0.226));
  const ur = M(new THREE.ShapeGeometry(ringShape, 16), new THREE.MeshPhysicalMaterial({ color: 0x8d8f94, metalness: 1, roughness: 0.12 }), 0, -H / 2 - 0.0016, sideZ, dev); ur.rotation.x = Math.PI / 2;
  const uw = M(new THREE.ShapeGeometry(stadium(0.71, 0.226), 16), new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 0.9 }), 0, -H / 2 - 0.0014, sideZ, dev); uw.rotation.x = Math.PI / 2;
  const ut = M(new THREE.ShapeGeometry(rshape(0.53, 0.056, 0.016), 4), new THREE.MeshStandardMaterial({ color: 0x232325, roughness: 0.6 }), 0, -H / 2 - 0.0018, sideZ, dev); ut.rotation.x = Math.PI / 2;

  const shc = document.createElement('canvas'); shc.width = shc.height = 256;
  const sx = shc.getContext('2d'); const gr = sx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,0.30)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  sx.fillStyle = gr; sx.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shc), transparent: true, depthWrite: false, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -H / 2 - 0.12, 0); shadow.scale.set(5.4, 1.6, 1); scene.add(shadow);

  return { scene, pivot, envTex, glassEnv, base, top, aniso };
}

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
    const { scene, pivot, envTex, glassEnv, base, top, aniso } = buildDevice(R);

    // Screens go straight onto the GPU as textures: 4096-wide on large displays, 2048-wide on phones.
    const hi = R.capabilities.maxTextureSize >= 4096 && window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) >= 1600;
    const shown = { idx: drive.current.idx || 0, prev: drive.current.idx || 0, at: 0 };
    let alive = true, loaded = 0, painted = false;
    const loader = new THREE.TextureLoader();
    const done = () => { if (++loaded === SCREENS.length && alive) { painted = true; base.visible = true; } };
    const texs = SCREENS.map((k) => {
      const t = loader.load(`/screens/${hi ? '4k/' : ''}${k}.webp`, done, undefined, done);
      t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso;
      return t;
    });
    const setMap = (mesh, t) => { if (mesh.material.map !== t) { mesh.material.map = t; mesh.material.needsUpdate = true; } };
    const paint = (now) => {
      if (!painted) return;
      const k = Math.min(1, (now - shown.at) / 480);
      if (k < 1) {
        setMap(base, texs[shown.prev]); setMap(top, texs[shown.idx]);
        top.material.opacity = k * k * (3 - 2 * k); top.visible = true;
      } else {
        setMap(base, texs[shown.idx]); top.visible = false;
      }
    };

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
      if ((P.idx || 0) !== shown.idx) { shown.prev = shown.idx; shown.idx = P.idx || 0; shown.at = now; }
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
      alive = false;
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      stage.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
      });
      texs.forEach((t) => t.dispose());
      envTex.dispose(); glassEnv.dispose(); R.dispose();
      if (R.domElement.parentNode) R.domElement.parentNode.removeChild(R.domElement);
    };
  }, [drive]);

  return (
    <div ref={stageRef} className={`stage ${className}${ready ? ' ready' : ''}${fallback ? ' fallback' : ''}`}>
      <img className="poster" src="/img/abble-1.webp" width={1600} height={699} alt="Abble 1 asking whether to ship it today or tomorrow" />
    </div>
  );
}
