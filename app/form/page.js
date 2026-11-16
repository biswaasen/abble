'use client';
import { useEffect, useRef, useState } from 'react';
import Logo from '@/components/Logo';
import { PRICE } from '@/lib/launch';

const KEYS = 'ABCDEFGHIJ';

const STEPS = [
  { key: 'phone', type: 'tel', q: 'What’s the best number to reach you?', placeholder: 'Phone number', autoComplete: 'tel', required: true },
  { key: 'name', type: 'text', q: 'And what should we call you?', placeholder: 'Name', autoComplete: 'name' },
  { key: 'company', type: 'text', q: 'Where do you build?', placeholder: 'Company or project', autoComplete: 'organization' },
  { key: 'away', type: 'choice', q: 'How often do you walk away after a prompt?', options: ['Rarely', 'Sometimes', 'Often', 'Almost always'] },
];

const COUNTRIES = {
  '+91': { flag: '🇮🇳', local: /^[6-9]\d{9}$/, hint: 'Enter a 10-digit Indian mobile number.' },
  '+1': { flag: '🇺🇸', local: /^[2-9]\d{2}[2-9]\d{6}$/, hint: 'Enter a 10-digit US phone number.' },
};

function readPhone(cc, raw) {
  let d = raw.replace(/\D/g, '');
  if (raw.trim().startsWith('+')) {
    if (d.length === 12 && d.startsWith('91')) return ['+91', d.slice(2)];
    if (d.length === 11 && d.startsWith('1')) return ['+1', d.slice(1)];
  }
  if (cc === '+91' && d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (cc === '+91' && d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (cc === '+1' && d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return [cc, d];
}

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

export default function FormPage() {
  const [answers, setAnswers] = useState({});
  const [cc, setCc] = useState('+91');
  const [i, setI] = useState(0);
  const [state, setState] = useState('asking');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const advanceTimer = useRef(0);

  const s = STEPS[i];
  const value = answers[s.key] ?? '';
  const isText = s.type !== 'choice';
  const last = i === STEPS.length - 1;
  const sending = state === 'sending';

  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/^(America|US)\//.test(zone)) setCc('+1');
  }, []);

  useEffect(() => {
    setError('');
    if (isText) inputRef.current?.focus();
    return () => clearTimeout(advanceTimer.current);
  }, [i, isText]);

  async function submit(a) {
    setState('sending');
    setError('');
    try {
      const r = await fetch('/api/early', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: a.phoneE164 || '',
          name: a.name || '',
          company: a.company || '',
          away: a.away || '',
          page: window.location.href,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'Something went wrong. Please try again.');
      setState('done');
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
      setState('asking');
    }
  }

  function next(a = answers) {
    if (sending) return;
    const cur = String(a[s.key] ?? '').trim();
    if (s.type === 'choice' && !cur) return;
    if (s.required && !cur) return;
    if (s.type === 'tel') {
      const [code, local] = readPhone(cc, cur);
      if (code !== cc) setCc(code);
      if (!COUNTRIES[code].local.test(local)) { setError(COUNTRIES[code].hint); return; }
      a = { ...a, phoneE164: code + local };
      setAnswers(a);
    }
    if (last) submit(a);
    else setI(i + 1);
  }

  function pick(opt) {
    if (sending) return;
    const a = { ...answers, [s.key]: opt };
    setAnswers(a);
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => next(a), 260);
  }

  useEffect(() => {
    if (state !== 'asking') return;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isText) return;
      if (e.key === 'Enter') { e.preventDefault(); next(); return; }
      const k = KEYS.indexOf(e.key.toUpperCase());
      if (k > -1 && k < s.options.length) { e.preventDefault(); pick(s.options[k]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (state === 'done') {
    const first = (answers.name || '').trim().split(' ')[0];
    return (
      <div className="fp fp-done">
        <main className="fp-main">
          <div className="fp-step">
            <a className="fp-mark" href="/" aria-label="Abble home"><Logo /></a>
            <h1 className="fp-q">You’re in{first ? `, ${first}` : ''}.</h1>
            <p className="fp-help">Your Abble 1 is reserved at {PRICE}. Pay nothing today. We’ll be in touch before it ships.</p>
            <a className="btn btn-lg fp-home" href="/">Back to home</a>
          </div>
        </main>
        <img className="fp-done-img" src="/img/hero.webp" width={1535} height={1024} alt="Abble 1 showing the time and four coding agents" />
      </div>
    );
  }

  return (
    <div className="fp">
      <main className="fp-main">
        <div className="fp-step" key={s.key}>
          <a className="product fp-product" href="/">Pre-order Abble 1 · {PRICE}</a>
          <h1 className="fp-q"><label htmlFor={isText ? `f-${s.key}` : undefined}>{s.q}</label></h1>

          {isText ? (
            <form className={`fp-field${s.type === 'tel' ? ' fp-tel' : ''}`} noValidate onSubmit={(e) => { e.preventDefault(); next(); }}>
              {s.type === 'tel' ? (
                <select className="fp-cc" aria-label="Country code" value={cc} onChange={(e) => { setCc(e.target.value); setError(''); inputRef.current?.focus(); }} disabled={sending}>
                  {Object.entries(COUNTRIES).map(([code, c]) => <option key={code} value={code}>{c.flag} {code}</option>)}
                </select>
              ) : null}
              <input
                id={`f-${s.key}`}
                ref={inputRef}
                className="fp-input"
                type={s.type}
                inputMode={s.type === 'tel' ? 'tel' : undefined}
                placeholder=" "
                autoComplete={s.autoComplete}
                maxLength={200}
                value={value}
                onChange={(e) => { setAnswers((a) => ({ ...a, [s.key]: e.target.value })); setError(''); }}
                readOnly={sending}
              />
              <span className="fp-label" aria-hidden="true">{s.placeholder}</span>
              <button
                type="submit"
                className={`fp-arrow${value.trim() || sending ? ' on' : ''}`}
                aria-label={sending ? 'Sending' : last ? 'Join' : 'Continue'}
                disabled={sending || (s.required && !value.trim())}
              >
                {sending ? <span className="spin" aria-hidden="true" /> : <Arrow />}
              </button>
            </form>
          ) : (
            <div className="fp-opts" role="group" aria-label={s.q}>
              {s.options.map((o, k) => (
                <button
                  key={o}
                  type="button"
                  className="fp-opt"
                  aria-pressed={value === o}
                  onClick={() => pick(o)}
                  aria-keyshortcuts={KEYS[k]}
                  disabled={sending}
                >
                  {o}
                  {sending && value === o ? <span className="spin" aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          )}

          {error ? <p className="fp-err" role="alert">{error}</p> : null}

          <div className="fp-foot">
            {i > 0 && !sending ? <button type="button" className="fp-prev" onClick={() => setI(i - 1)}>← Back</button> : null}
            <span className="fp-count">{i + 1} of {STEPS.length}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
