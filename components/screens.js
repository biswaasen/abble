const FONT = "'Helvetica Neue',Helvetica,-apple-system,BlinkMacSystemFont,Arial,sans-serif";
const INK = '#1d1d1f';
const GREY = '#6e6e73';
const BLUE = '#0071e3';

export const AGENT_KEYS = ['claude', 'codex', 'cursor', 'gemini-cli'];

function setFont(ctx, weight, size, track = -0.01) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${(size * track).toFixed(2)}px`;
}

function text(ctx, str, x, y, { weight = 400, size = 32, color = INK, align = 'left', track } = {}) {
  setFont(ctx, weight, size, track);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function round(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wallpaper(ctx, W, H) {
  const g = ctx.createLinearGradient(0, H, W, 0);
  g.addColorStop(0, '#f4f9fe');
  g.addColorStop(0.45, '#d9ecfc');
  g.addColorStop(1, '#8cc8f8');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function tile(ctx, img, x, y, size, key) {
  const r = size * 0.24;
  ctx.save();
  ctx.shadowColor = 'rgba(16, 24, 40, 0.10)';
  ctx.shadowBlur = size * 0.16;
  ctx.shadowOffsetY = size * 0.04;
  round(ctx, x, y, size, size, r);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.restore();
  if (!img) return;
  const p = key === 'claude' ? size * 0.18 : 0;
  ctx.save();
  round(ctx, x, y, size, size, r);
  ctx.clip();
  ctx.drawImage(img, x + p, y + p, size - 2 * p, size - 2 * p);
  ctx.restore();
}

function header(ctx, W, icons, right, rightColor = GREY) {
  tile(ctx, icons.claude, 64, 58, 66, 'claude');
  text(ctx, 'Claude Code', 150, 104, { weight: 500, size: 34 });
  if (right) text(ctx, right, W - 72, 104, { size: 30, color: rightColor, align: 'right' });
}

function button(ctx, x, y, w, h, label, primary) {
  round(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = primary ? INK : 'rgba(255, 255, 255, 0.72)';
  ctx.fill();
  text(ctx, label, x + w / 2, y + h / 2 + 14, { weight: 500, size: 40, color: primary ? '#fff' : INK, align: 'center' });
}

function agentStack(ctx, icons, keys, x, y, size, step) {
  keys.forEach((k, i) => tile(ctx, icons[k], x + i * step, y, size, k));
  return x + (keys.length - 1) * step + size;
}

const AGENT_NAMES = { claude: 'Claude Code', codex: 'Codex', cursor: 'Cursor', 'gemini-cli': 'Gemini CLI' };

function idle(ctx, W, H, t, icons) {
  text(ctx, '9:41', 56, 222, { weight: 300, size: 200, track: -0.02 });
  text(ctx, 'Sunday, 15 November', 66, 290, { size: 38, color: INK, track: 0 });

  const label = 'All clear · 3 working';
  setFont(ctx, 400, 36, 0);
  const pw = ctx.measureText(label).width + 72, ph = 76, px = 56, py = 330;
  round(ctx, px, py, pw, ph, ph / 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.fill();
  text(ctx, label, px + 36, py + ph / 2 + 13, { size: 36, track: 0 });

  const size = 112, gap = (W - 2 * 92 - 4 * size) / 3, y = H - 64 - 44 - size;
  AGENT_KEYS.forEach((k, i) => {
    const x = 92 + i * (size + gap);
    tile(ctx, icons[k], x, y, size, k);
    text(ctx, AGENT_NAMES[k], x + size / 2, y + size + 44, { size: 30, align: 'center', track: 0 });
  });
}

function ask(ctx, W, H, t, icons) {
  header(ctx, W, icons, 'now');
  text(ctx, 'Publish the new', 64, 266, { weight: 500, size: 80, track: -0.015 });
  text(ctx, 'homepage?', 64, 354, { weight: 500, size: 80, track: -0.015 });
  text(ctx, 'Tested on phone and desktop', 66, 420, { size: 36, color: GREY });
  const bh = 116, by = H - 60 - bh, bw = (W - 128 - 20) / 2;
  button(ctx, 64, by, bw, bh, 'Publish', true);
  button(ctx, 64 + bw + 20, by, bw, bh, 'Not yet', false);
}

function talk(ctx, W, H, t, icons) {
  setFont(ctx, 500, 32);
  const label = 'Claude Code', lw = ctx.measureText(label).width, pw = 56 + 16 + lw, px = (W - pw) / 2;
  tile(ctx, icons.claude, px, 60, 56, 'claude');
  text(ctx, label, px + 72, 99, { weight: 500, size: 32 });

  const bars = [0.35, 0.6, 0.85, 1, 0.85, 0.6, 0.35], bw = 22, gap = 20;
  let x = (W - (bars.length * bw + (bars.length - 1) * gap)) / 2;
  bars.forEach((b, i) => {
    const amp = b * (0.4 + 0.6 * Math.abs(Math.sin(t * 4.6 + i * 0.85)));
    const h = 26 + amp * 124;
    round(ctx, x, 300 - h / 2, bw, h, bw / 2);
    ctx.fillStyle = BLUE;
    ctx.fill();
    x += bw + gap;
  });

  text(ctx, 'Make the logo', W / 2, 516, { weight: 500, size: 66, align: 'center', track: -0.015 });
  text(ctx, 'a little bigger.', W / 2, 590, { weight: 500, size: 66, align: 'center', track: -0.015 });
}

function sent(ctx, W, H, t, icons) {
  header(ctx, W, icons, 'now');
  text(ctx, 'Published.', 60, 338, { weight: 500, size: 112, track: -0.02 });
  text(ctx, 'Your new homepage is live.', 66, 414, { size: 38, color: GREY });
  const end = agentStack(ctx, icons, AGENT_KEYS.slice(1), 64, H - 64 - 58, 58, 54);
  text(ctx, 'Back to work · 3 agents', end + 22, H - 64 - 18, { size: 32, color: GREY });
}

const SCREENS = { idle, ask, talk, sent };

export function drawScreen(ctx, key, w, h, t, icons) {
  const s = w / 1024;
  ctx.save();
  ctx.setTransform(s, 0, 0, s, 0, 0);
  const W = 1024, H = h / s;
  wallpaper(ctx, W, H);
  SCREENS[key](ctx, W, H, t, icons);
  ctx.restore();
}
