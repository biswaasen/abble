// Receives the early-list form and appends one row to the Google Sheet through the Apps Script web app.
// The Apps Script URL and the shared secret stay on the server (Vercel env vars), never in the browser.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v, n = 200) => String(v ?? '').trim().slice(0, n);
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }

  // Bots fill the hidden field. Pretend it worked and drop it.
  if (clip(b.website)) return json({ ok: true });

  const email = clip(b.email, 200).toLowerCase();
  if (!EMAIL.test(email)) return json({ ok: false, error: 'Please enter a valid email.' }, 400);

  const row = {
    name: clip(b.name, 120),
    email,
    phone: clip(b.phone, 40),
    role: clip(b.role, 40),
    company: clip(b.company, 200),
    agents: (Array.isArray(b.agents) ? b.agents : []).map((a) => clip(a, 40)).filter(Boolean).slice(0, 10),
    hours: clip(b.hours, 40),
    away: clip(b.away, 40),
    okToCall: b.okToCall === true,
    country: clip(req.headers.get('x-vercel-ip-country'), 8),
    page: clip(b.page, 300),
    browser: clip(req.headers.get('user-agent'), 300),
  };

  const url = process.env.SHEET_WEBHOOK_URL;
  const secret = process.env.SHEET_SECRET;
  if (!url || !secret) return json({ ok: false, error: 'Sign-ups open very soon. Please try again later.' }, 503);

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret, ...row }),
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j || j.ok !== true) throw new Error('sheet');
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'We could not save that. Please try again.' }, 502);
  }
}

export function GET() {
  return json({ ok: true, configured: Boolean(process.env.SHEET_WEBHOOK_URL && process.env.SHEET_SECRET) });
}
