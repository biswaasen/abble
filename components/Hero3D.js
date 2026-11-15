'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* The real abble, in 3D: 38 x 28 x 5 mm space gray tile, 3 mm corners, one sheet of black glass.
   The screen plays the six interface masters. Drag to turn it. */
const STATES = [
  { k: 'idle', label: 'Idle', ms: 4200 },
  { k: 'ask', label: 'Needs you', ms: 3400 },
  { k: 'talk', label: 'Talk', ms: 3000 },
  { k: 'steps', label: 'Smart steps', ms: 3000 },
  { k: 'review', label: 'Review', ms: 2800 },
  { k: 'sent', label: 'Sent', ms: 2600 },
];

/* sizes in cm */
const W = 3.8, H = 2.8, D = 0.5, RAD = 0.3, RB = 0.05, GB = 0.05, INS = 0.035;
const ZG = D / 2 - 0.06;
const DW = W - 2 * INS, DH = H - 2 * INS;
const FV = (24 * Math.PI) / 360;

function buildDevice(R) {
  const V2 = THREE.Vector2;
  const scene = new THREE.Scene();

  /* studio environment: dark box with soft light panels, so the metal has real reflections */
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

  /* bead-blast grain so the aluminium sparkles a little */
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
  const pivot = new THREE.Group(); scene.add(pivot);
  const dev = new THREE.Group(); pivot.add(dev);

  /* one smooth swept surface per part: rounded perimeter x side profile, true normals, no seams */
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
  /* frame: back face -> 0.5 mm roll -> flat side up to the glass */
  const fprof = [];
  for (let k = 0; k <= 14; k++) { const f = (Math.PI / 2) * k / 14; fprof.push({ t: RB - RB * Math.sin(f), z: -D / 2 + RB - RB * Math.cos(f), nr: Math.sin(f), nz: -Math.cos(f) }); }
  [0.25, 0.5, 0.75, 1].forEach((a) => fprof.push({ t: 0, z: (-D / 2 + RB) + a * (ZG - (-D / 2 + RB)), nr: 1, nz: 0 }));
  M(sweep(PER, fprof), alu, 0, 0, 0, dev);
  const back = M(new THREE.ShapeGeometry(rshape(W - 2 * RB, H - 2 * RB, RAD - RB), 12), alu, 0, 0, -D / 2, dev); back.rotation.y = Math.PI;
  /* glass: flat black edge, then a 0.5 mm roll onto the face */
  const gprof = [{ t: 0, z: ZG, nr: 1, nz: 0 }, { t: 0, z: D / 2 - GB, nr: 1, nz: 0 }];
  for (let k = 1; k <= 10; k++) { const f = (Math.PI / 2) * k / 10; gprof.push({ t: GB - GB * Math.cos(f), z: D / 2 - GB + GB * Math.sin(f), nr: Math.cos(f), nz: Math.sin(f) }); }
  M(sweep(PER, gprof), glass, 0, 0, 0, dev);
  M(new THREE.ShapeGeometry(rshape(W - 2 * GB, H - 2 * GB, RAD - GB), 12), glass, 0, 0, D / 2, dev);

  /* antenna breaks and one mic pinhole. No buttons. */
  const sideZ = (ZG + (-D / 2 + RB)) / 2;
  [[-1.5, 1], [1.5, 1], [-1.5, -1], [1.5, -1]].forEach(([x, sgn]) => {
    const a = M(new THREE.PlaneGeometry(0.035, ZG - (-D / 2 + RB) - 0.02), antM, x, sgn * (H / 2 + 0.0015), sideZ, dev);
    a.rotation.x = sgn > 0 ? -Math.PI / 2 : Math.PI / 2;
  });
  const mic = M(new THREE.CircleGeometry(0.022, 24), wellM, -1.05, H / 2 + 0.002, sideZ, dev); mic.rotation.x = -Math.PI / 2;

  /* screen: a canvas texture over the black glass, so the glass reflections stay alive */
  const sc = document.createElement('canvas'); sc.width = 1024; sc.height = Math.round(1024 * DH / DW);
  const tex = new THREE.CanvasTexture(sc); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
  M(new THREE.PlaneGeometry(DW, DH), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), 0, 0, D / 2 + 0.0012, dev);
  const glc = document.createElement('canvas'); glc.width = 512; glc.height = 384;
  const glx = glc.getContext('2d'); const gg = glx.createLinearGradient(0, 0, 512, 384);
  gg.addColorStop(0, 'rgba(255,255,255,0.07)'); gg.addColorStop(0.3, 'rgba(255,255,255,0.015)'); gg.addColorStop(0.5, 'rgba(255,255,255,0)');
  glx.fillStyle = gg; glx.fillRect(0, 0, 512, 384);
  const glt = new THREE.CanvasTexture(glc); glt.encoding = THREE.sRGBEncoding;
  M(new THREE.PlaneGeometry(W - 2 * GB, H - 2 * GB), new THREE.MeshBasicMaterial({ map: glt, transparent: true, depthWrite: false, toneMapped: false }), 0, 0, D / 2 + 0.0025, dev);

  /* back: thin wordmark */
  const wc = document.createElement('canvas'); wc.width = 1024; wc.height = 512;
  const wt = new THREE.CanvasTexture(wc); wt.encoding = THREE.sRGBEncoding; wt.anisotropy = 8;
  const wm = M(new THREE.PlaneGeometry(2.0, 1.0), new THREE.MeshBasicMaterial({ map: wt, transparent: true, toneMapped: false, depthWrite: false }), 0, 0, -D / 2 - 0.0015, dev);
  wm.rotation.y = Math.PI;
  const drawWordmark = () => {
    const x = wc.getContext('2d'); x.clearRect(0, 0, 1024, 512); x.fillStyle = 'rgba(255,255,255,0.34)';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = "200 250px 'Google Sans Flex Variable','Google Sans Flex',-apple-system,'Helvetica Neue',Arial,sans-serif";
    x.fillText('abble', 512, 262); wt.needsUpdate = true;
  };
  drawWordmark();

  /* USB-C on the bottom long edge */
  const stadium = (w, h) => rshape(w, h, h / 2);
  const ringShape = stadium(0.93, 0.36); ringShape.holes.push(stadium(0.894, 0.326));
  const ur = M(new THREE.ShapeGeometry(ringShape, 16), new THREE.MeshPhysicalMaterial({ color: 0x8d8f94, metalness: 1, roughness: 0.12 }), 0, -H / 2 - 0.0016, sideZ, dev); ur.rotation.x = Math.PI / 2;
  const uw = M(new THREE.ShapeGeometry(stadium(0.894, 0.326), 16), new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 0.9 }), 0, -H / 2 - 0.0014, sideZ, dev); uw.rotation.x = Math.PI / 2;
  const ut = M(new THREE.ShapeGeometry(rshape(0.66, 0.07, 0.02), 4), new THREE.MeshStandardMaterial({ color: 0x232325, roughness: 0.6 }), 0, -H / 2 - 0.0018, sideZ, dev); ut.rotation.x = Math.PI / 2;

  /* soft contact shadow */
  const shc = document.createElement('canvas'); shc.width = shc.height = 256;
  const sx = shc.getContext('2d'); const gr = sx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,0.30)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  sx.fillStyle = gr; sx.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shc), transparent: true, depthWrite: false, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -H / 2 - 0.12, 0); shadow.scale.set(6.6, 1.8, 1); scene.add(shadow);

  return { scene, pivot, sc, tex, drawWordmark, envTex };
}

export default function Hero3D() {
  const stageRef = useRef(null);
  const ctl = useRef({ idx: 0, changedAt: 0, prev: 0 });
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  /* auto-play the screens until someone picks one */
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % STATES.length), STATES[idx].ms);
    return () => clearTimeout(t);
  }, [idx, auto]);

  useEffect(() => {
    const c = ctl.current;
    if (c.idx !== idx) { c.prev = c.idx; c.idx = idx; c.changedAt = performance.now(); }
  }, [idx]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl') || probe.getContext('experimental-webgl'))) { setFallback(true); return; } /* show the photo instead */

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
    Object.assign(R.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' }); /* never let the canvas size the hero */
    stage.appendChild(R.domElement);

    const cam = new THREE.PerspectiveCamera(24, 1, 0.3, 200);
    const { scene, pivot, sc, tex, drawWordmark, envTex } = buildDevice(R);

    /* screen painting: cover-fit each master into the glass, rounded to match the corners, cross-fade between states */
    const imgs = {};
    const sx = sc.getContext('2d');
    const rr = ((RAD - INS) / DW) * sc.width;
    const clip = () => {
      const w = sc.width, h = sc.height, r = rr;
      sx.beginPath(); sx.moveTo(r, 0); sx.arcTo(w, 0, w, h, r); sx.arcTo(w, h, 0, h, r); sx.arcTo(0, h, 0, 0, r); sx.arcTo(0, 0, w, 0, r); sx.closePath();
    };
    const cover = (img, a) => {
      if (!img || a <= 0) return;
      const s = Math.max(sc.width / img.width, sc.height / img.height), w = img.width * s, h = img.height * s;
      sx.globalAlpha = a; sx.drawImage(img, (sc.width - w) / 2, (sc.height - h) / 2, w, h); sx.globalAlpha = 1;
    };
    let lastPaint = -1;
    const paint = (now) => {
      const c = ctl.current, k = Math.min(1, (now - c.changedAt) / 420);
      const key = c.idx * 1000 + Math.round(k * 100);
      if (key === lastPaint) return;
      lastPaint = key;
      sx.clearRect(0, 0, sc.width, sc.height); sx.save(); clip(); sx.clip();
      sx.fillStyle = '#000'; sx.fillRect(0, 0, sc.width, sc.height);
      if (k < 1) cover(imgs[STATES[c.prev].k], 1);
      cover(imgs[STATES[c.idx].k], k < 1 ? k * k * (3 - 2 * k) : 1);
      sx.restore(); tex.needsUpdate = true;
    };
    STATES.forEach((s) => {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => { imgs[s.k] = im; lastPaint = -1; };
      im.src = `/screens/${s.k}.webp`;
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawWordmark).catch(() => {});

    /* drag to turn, otherwise a slow sway */
    let uy = 0, ux = 0, drag = false, lx = 0, ly = 0, t = 0;
    const down = (e) => { drag = true; lx = e.clientX; ly = e.clientY; stage.style.cursor = 'grabbing'; };
    const move = (e) => {
      if (!drag) return;
      uy += (e.clientX - lx) * 0.01; ux = Math.max(-0.6, Math.min(0.8, ux + (e.clientY - ly) * 0.006));
      lx = e.clientX; ly = e.clientY;
    };
    const up = () => { drag = false; stage.style.cursor = ''; };
    stage.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);

    let baseD = 6;
    const size = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      const needH = (H / 2) / Math.tan(FV) * 1.42, needW = (W / 2) / (Math.tan(FV) * cam.aspect) * 1.36;
      baseD = Math.max(needH, needW);
    };
    const ro = new ResizeObserver(size); ro.observe(stage); size();

    /* only render while the hero is on screen */
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' });
    io.observe(stage);

    pivot.rotation.y = reduce ? -0.5 : -1.35;
    pivot.rotation.x = 0.1;
    const clock = new THREE.Clock();
    let raf = 0, shown = false;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      const now = performance.now();
      if (!drag && !reduce) t += dt;
      const ry = -0.5 + uy + (reduce ? 0 : Math.sin(t * 0.45) * 0.22);
      const rx = 0.1 + ux + (reduce ? 0 : Math.sin(t * 0.31) * 0.03);
      pivot.rotation.y += (ry - pivot.rotation.y) * Math.min(1, dt * (shown ? 6 : 2.2));
      pivot.rotation.x += (rx - pivot.rotation.x) * Math.min(1, dt * 6);
      cam.position.set(0, baseD * 0.1, baseD); cam.lookAt(0, -0.05, 0);
      paint(now);
      R.render(scene, cam);
      if (!shown && imgs.idle) { shown = true; setReady(true); }
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
  }, []);

  const pick = (i) => { setAuto(false); setIdx(i); };

  return (
    <div>
      <div ref={stageRef} className={`stage${ready ? ' ready' : ''}${fallback ? ' fallback' : ''}`}>
        <img className="poster" src="/img/03-hero.webp" width={1536} height={1024} alt="abble, a matchbox-sized space gray device showing the time and four coding agents" loading="lazy" />
      </div>
      <div className="states" role="group" aria-label="Show a screen">
        {STATES.map((s, i) => (
          <button key={s.k} type="button" aria-pressed={i === idx} onClick={() => pick(i)}>{s.label}</button>
        ))}
      </div>
      <p className="hint">Drag to turn it.</p>
    </div>
  );
}
