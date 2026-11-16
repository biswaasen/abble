export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PHONE = /^\+(91[6-9]\d{9}|1[2-9]\d{2}[2-9]\d{6})$/;
const clip = (v, n = 200) => String(v ?? '').trim().slice(0, n);
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }

  const phone = clip(b.phone, 20);
  if (!PHONE.test(phone)) return json({ ok: false, error: 'Please enter a US or Indian phone number.' }, 400);

  const row = {
    phone,
    name: clip(b.name, 120),
    company: clip(b.company, 200),
    away: clip(b.away, 40),
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
