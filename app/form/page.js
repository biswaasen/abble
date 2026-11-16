'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Logo from '@/components/Logo';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const KEYS = 'ABCDEFGHIJ';

const STEPS = [
  { key: 'name', type: 'text', q: 'First, what should we call you?', placeholder: 'Name', autoComplete: 'name' },
  { key: 'email', type: 'email', q: 'Where can we reach you?', placeholder: 'Email', autoComplete: 'email', required: true },
  { key: 'role', type: 'choice', q: 'What do you do?', options: ['Founder', 'Engineer', 'Designer', 'Product manager', 'Student', 'Other'] },
  { key: 'company', type: 'text', q: 'Where do you build?', placeholder: 'Company or project', autoComplete: 'organization' },
  { key: 'agents', type: 'multi', q: 'Which agents do you use most?', options: ['Claude Code', 'Codex', 'Cursor', 'Gemini CLI', 'Other'] },
  { key: 'hours', type: 'choice', q: 'Hours a day with agents?', options: ['Less than 1', '1 to 3', '3 to 6', 'More than 6'] },
  { key: 'away', type: 'choice', q: 'How often are you away from the screen while they run?', options: ['Rarely', 'Sometimes', 'Often', 'Most of the day'] },
  { key: 'okToCall', type: 'choice', q: 'Can we call you about the design?', options: ['Yes', 'No'] },
  { key: 'phone', type: 'tel', q: 'Best number to call?', placeholder: 'Phone number', autoComplete: 'tel', when: (a) => a.okToCall === 'Yes' },
];

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

export default function FormPage() {
  const [answers, setAnswers] = useState({ agents: [] });
  const [i, setI] = useState(0);
  const [state, setState] = useState('asking');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const advanceTimer = useRef(0);

  const steps = useMemo(() => STEPS.filter((s) => !s.when || s.when(answers)), [answers]);
  const s = steps[Math.min(i, steps.length - 1)];
  const value = answers[s.key] ?? (s.type === 'multi' ? [] : '');
  const isText = s.type === 'text' || s.type === 'email' || s.type === 'tel';
  const last = i === steps.length - 1;
  const sending = state === 'sending';

  useEffect(() => {
    setError('');
    if (isText) inputRef.current?.focus();
    return () => clearTimeout(advanceTimer.current);
  }, [i, isText]);

  const set = (v) => setAnswers((a) => ({ ...a, [s.key]: v }));

  async function submit(a) {
    setState('sending');
    setError('');
    try {
      const r = await fetch('/api/early', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: a.name || '',
          email: a.email || '',
          phone: a.okToCall === 'Yes' ? a.phone || '' : '',
          role: a.role || '',
          company: a.company || '',
          agents: a.agents || [],
          hours: a.hours || '',
          away: a.away || '',
          okToCall: a.okToCall === 'Yes',
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
    const cur = a[s.key] ?? '';
    if (s.type === 'choice' && !cur) return;
    if (s.type === 'email' && !EMAIL.test(String(cur).trim())) { setError('That email does not look right.'); return; }
    if (s.required && String(cur).trim() === '') return;
    const live = STEPS.filter((x) => !x.when || x.when(a));
    if (i >= live.length - 1) submit(a);
    else setI(i + 1);
  }

  function pick(opt) {
    if (sending) return;
    if (s.type === 'multi') {
      set(value.includes(opt) ? value.filter((x) => x !== opt) : [...value, opt]);
      return;
    }
    const a = { ...answers, [s.key]: opt };
    setAnswers(a);
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => next(a), 260);
  }

  useEffect(() => {
    if (state !== 'asking') return;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter' && !isText) { e.preventDefault(); next(); return; }
      if (!s.options || isText) return;
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
            <h1 className="fp-q">You’re on the list{first ? `, ${first}` : ''}.</h1>
            <p className="fp-help">
              {answers.okToCall === 'Yes' ? 'Thank you for helping shape Abble 1. We will call you soon about the design.' : 'Thank you for helping shape Abble 1. Early access news comes to your inbox first.'}
            </p>
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
          <a className="product fp-product" href="/">Abble 1</a>
          <h1 className="fp-q"><label htmlFor={isText ? `f-${s.key}` : undefined}>{s.q}</label></h1>

          {isText ? (
            <form className="fp-field" noValidate onSubmit={(e) => { e.preventDefault(); next(); }}>
              <input
                id={`f-${s.key}`}
                ref={inputRef}
                className="fp-input"
                type={s.type}
                inputMode={s.type === 'tel' ? 'tel' : s.type === 'email' ? 'email' : undefined}
                placeholder=" "
                autoComplete={s.autoComplete || 'off'}
                maxLength={200}
                value={value}
                onChange={(e) => { set(e.target.value); setError(''); }}
                readOnly={sending}
              />
              <span className="fp-label" aria-hidden="true">{s.placeholder}</span>
              <button
                type="submit"
                className={`fp-arrow${String(value).trim() || sending ? ' on' : ''}`}
                aria-label={sending ? 'Sending' : last ? 'Join' : 'Continue'}
                disabled={sending || (s.required && String(value).trim() === '')}
              >
                {sending ? <span className="spin" aria-hidden="true" /> : <Arrow />}
              </button>
            </form>
          ) : (
            <div className="fp-opts" role="group" aria-label={s.q}>
              {s.options.map((o, k) => {
                const on = s.type === 'multi' ? value.includes(o) : value === o;
                return (
                  <button
                    key={o}
                    type="button"
                    className="fp-opt"
                    aria-pressed={on}
                    onClick={() => pick(o)}
                    aria-keyshortcuts={KEYS[k]}
                    disabled={sending}
                  >
                    {o}
                    {sending && on ? <span className="spin" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          )}

          {error ? <p className="fp-err" role="alert">{error}</p> : null}

          <div className="fp-foot">
            {s.type === 'multi' ? (
              <button type="button" className="btn btn-lg" onClick={() => next()}>Continue</button>
            ) : null}
            {i > 0 && !sending ? <button type="button" className="fp-prev" onClick={() => setI(i - 1)}>← Back</button> : null}
            <span className="fp-count">{i + 1} of {steps.length}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
