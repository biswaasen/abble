'use client';
import { useEffect, useRef, useState } from 'react';
import Device3D, { SCREEN } from '@/components/Device3D';

const TAU = Math.PI * 2;

/* One pinned abble 1 that follows a real moment, then turns to show the hardware.
   Every turn goes the same way and never more than half a spin, so it never whips round. */
const STAGES = [
  { t: 'Your agents keep working.', screen: SCREEN.idle, ry: -0.35, rx: 0.08 },
  { t: 'One of them needs you.', screen: SCREEN.ask, ry: -0.12, rx: 0.05 },
  { t: 'Tap. Or just say it.', screen: SCREEN.talk, ry: 0.18, rx: 0.08 },
  { t: 'Back to work.', screen: SCREEN.sent, ry: -0.3, rx: 0.1 },
  { t: 'Five millimetres thin.', screen: SCREEN.sent, ry: -1.42, rx: 0.04, design: true },
  { t: 'One piece of aluminium.', screen: SCREEN.idle, ry: -Math.PI - 0.3, rx: 0.1 },
  { t: 'One port. Nothing to press.', screen: SCREEN.idle, ry: -TAU - 0.3, rx: -0.95 },
];
const N = STAGES.length;
const HOLD = 0.55;
const DESIGN_AT = STAGES.findIndex((s) => s.design) / N;

/* Feel. A critically damped spring eases the device toward the scroll position:
   SMOOTH is the time it takes to settle (its weight), MAX_SPEED caps how many stages a hard trackpad flick can sweep per second. */
const SMOOTH = 0.32;
const MAX_SPEED = 2.4 / N;

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

function at(p) {
  const x = Math.min(N - 1, Math.max(0, p || 0) * N), i = Math.floor(x), f = x - i;
  const a = STAGES[i], b = STAGES[Math.min(N - 1, i + 1)];
  const t = f <= HOLD ? 0 : (f - HOLD) / (1 - HOLD), s = t * t * (3 - 2 * t);
  const stage = Math.min(N - 1, Math.floor(x + (1 - HOLD) / 2));
  return { ry: a.ry + (b.ry - a.ry) * s, rx: a.rx + (b.rx - a.rx) * s, stage };
}

export default function HowItWorks() {
  const ref = useRef(null);
  const drive = useRef({ ry: STAGES[0].ry, rx: STAGES[0].rx, idx: STAGES[0].screen });
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const target = () => {
      const r = el.getBoundingClientRect(), travel = r.height - (window.innerHeight - 64);
      return travel > 0 ? Math.min(1, Math.max(0, (64 - r.top) / travel)) : 0;
    };
    let cur = target(), vel = 0, shown = -1, raf = 0, last = 0;
    const apply = () => {
      const s = at(cur);
      drive.current = { ry: s.ry, rx: s.rx, idx: STAGES[s.stage].screen };
      if (s.stage !== shown) { shown = s.stage; setStage(s.stage); }
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
    apply();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
    };
  }, []);

  return (
    <div className="look" ref={ref}>
      <span id="design" className="look-anchor" style={{ '--at': DESIGN_AT }} aria-hidden="true" />
      <div className="look-stick">
        <Device3D className="look-stage" drive={drive} fit={0.92} sway={0} />
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
