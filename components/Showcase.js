'use client';
import { useEffect, useRef, useState } from 'react';
import Device3D, { SCREEN } from '@/components/Device3D';

const STAGES = [
  { t: 'Your agents keep working.', screen: SCREEN.idle, ry: -0.35, rx: 0.08 },
  { t: 'One of them needs you.', screen: SCREEN.ask, ry: -0.12, rx: 0.05 },
  { t: 'Tap. Or just say it.', screen: SCREEN.talk, ry: 0.18, rx: 0.08 },
  { t: 'Back to work.', screen: SCREEN.sent, ry: -0.3, rx: 0.1 },
];
const N = STAGES.length;
const HOLD = 0.55;
const INTRO = 1 / (N + 1);
const START_SCALE = 0.86;

const SMOOTH = 0.32;
const MAX_SPEED = 2.4 / (N + 1);

function smoothDamp(cur, target, vel, dt) {
  const omega = 2 / SMOOTH, x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const limit = MAX_SPEED * SMOOTH;
  const change = Math.max(-limit, Math.min(limit, cur - target));
  const goal = cur - change;
  const temp = (vel + omega * change) * dt;
  let next = goal + (change + temp) * decay;
  let v = (vel - omega * temp) * decay;
  if ((target - cur > 0) === (next > target)) { next = target; v = 0; }
  return [next, v];
}

const ease = (t) => t * t * (3 - 2 * t);

function storyAt(q) {
  const x = Math.min(N - 1, Math.max(0, q || 0) * N), i = Math.floor(x), f = x - i;
  const a = STAGES[i], b = STAGES[Math.min(N - 1, i + 1)];
  const s = ease(f <= HOLD ? 0 : (f - HOLD) / (1 - HOLD));
  const stage = Math.min(N - 1, Math.floor(x + (1 - HOLD) / 2));
  return { ry: a.ry + (b.ry - a.ry) * s, rx: a.rx + (b.rx - a.rx) * s, stage };
}

export default function Showcase() {
  const ref = useRef(null);
  const stickRef = useRef(null);
  const textRef = useRef(null);
  const stageRef = useRef(null);
  const drive = useRef({ ry: STAGES[0].ry, rx: STAGES[0].rx, idx: STAGES[0].screen, sway: 1 });
  const [stage, setStage] = useState(-1);

  useEffect(() => {
    const el = ref.current, stick = stickRef.current, text = textRef.current, box = stageRef.current;
    const target = () => {
      const r = el.getBoundingClientRect(), travel = r.height - (window.innerHeight - 64);
      return travel > 0 ? Math.min(1, Math.max(0, (64 - r.top) / travel)) : 0;
    };

    let startY = 0;
    const measure = () => {
      const h = stick.clientHeight, under = text.offsetTop + text.offsetHeight;
      const centre = box.offsetTop + box.offsetHeight / 2;
      startY = (under + h) / 2 - centre;
    };

    let cur = target(), vel = 0, shown = -2, raf = 0, last = 0;
    const apply = () => {
      const e = ease(Math.min(1, cur / INTRO));
      text.style.opacity = String(Math.max(0, 1 - e * 1.25));
      text.style.filter = e > 0.002 ? `blur(${(e * 14).toFixed(2)}px)` : 'none';
      text.style.transform = `translate3d(0, ${(-e * 48).toFixed(1)}px, 0)`;
      text.style.visibility = e > 0.995 ? 'hidden' : 'visible';
      box.style.transform = `translate3d(0, ${((1 - e) * startY).toFixed(1)}px, 0) scale(${(START_SCALE + (1 - START_SCALE) * e).toFixed(4)})`;

      const st = storyAt((cur - INTRO) / (1 - INTRO));
      drive.current = { ry: st.ry, rx: st.rx, idx: STAGES[st.stage].screen, sway: 1 - e };
      const visible = cur < INTRO * 0.97 ? -1 : st.stage;
      if (visible !== shown) { shown = visible; setStage(visible); }
    };
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const goal = target();
      [cur, vel] = smoothDamp(cur, goal, vel, dt);
      apply();
      raf = Math.abs(goal - cur) > 1e-4 || Math.abs(vel) > 1e-4 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const resize = () => { measure(); apply(); kick(); };

    measure();
    apply();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', resize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="look" ref={ref}>
      <span id="how" className="look-anchor" style={{ '--at': INTRO }} aria-hidden="true" />
      <div className="look-stick" ref={stickRef}>
        <div className="show-text" ref={textRef}>
          <p className="product">Abble 1</p>
          <h1 className="hero-title">The ultimate interface<br />for the agentic era.</h1>
        </div>
        <div className="show-stage" ref={stageRef}>
          <Device3D className="look-stage" drive={drive} />
        </div>
        <div className="look-caps">
          {STAGES.map((s, i) => (
            <div key={s.t} className={i === stage ? 'on' : undefined} aria-hidden={i !== stage}>
              <h3>{s.t}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
