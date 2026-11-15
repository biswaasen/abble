'use client';
import { useState } from 'react';

const AGENTS = ['Claude Code', 'Codex', 'Cursor', 'Gemini CLI', 'Other'];

export default function EarlyForm() {
  const [agents, setAgents] = useState([]);
  const [state, setState] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');

  const toggle = (a) => setAgents((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));

  async function onSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get('name'),
      email: f.get('email'),
      phone: f.get('phone'),
      role: f.get('role'),
      company: f.get('company'),
      agents,
      hours: f.get('hours'),
      away: f.get('away'),
      okToCall: f.get('okToCall') === 'on',
      website: f.get('website'),
      page: window.location.href,
    };
    setState('sending');
    setError('');
    try {
      const r = await fetch('/api/early', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'Something went wrong. Please try again.');
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div className="done" role="status">
        <p>You are on the list.</p>
        <p>If you said yes to a call, we will be in touch.</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <div className="grid2">
        <div className="fld"><label className="lab" htmlFor="f-name">Full name</label><input id="f-name" name="name" className="in" type="text" autoComplete="name" maxLength={120} /></div>
        <div className="fld"><label className="lab" htmlFor="f-email">Email</label><input id="f-email" name="email" className="in" type="email" autoComplete="email" required maxLength={200} /></div>
        <div className="fld"><label className="lab" htmlFor="f-phone">Phone</label><input id="f-phone" name="phone" className="in" type="tel" autoComplete="tel" maxLength={40} /></div>
        <div className="fld">
          <label className="lab" htmlFor="f-role">You are a</label>
          <select id="f-role" name="role" className="in" defaultValue="Founder">
            {['Founder', 'Engineer', 'Designer', 'Product manager', 'Student', 'Other'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="fld"><label className="lab" htmlFor="f-co">Current role and company</label><input id="f-co" name="company" className="in" type="text" maxLength={200} /></div>
      <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
        <legend className="lab" style={{ padding: 0, marginBottom: 10 }}>Agents you use most</legend>
        <div className="chips">
          {AGENTS.map((a) => (
            <button key={a} type="button" className="chip" aria-pressed={agents.includes(a)} onClick={() => toggle(a)}>{a}</button>
          ))}
        </div>
      </fieldset>
      <div className="grid2">
        <div className="fld">
          <label className="lab" htmlFor="f-hours">Hours a day with agents</label>
          <select id="f-hours" name="hours" className="in" defaultValue="3 to 6">
            {['Less than 1', '1 to 3', '3 to 6', 'More than 6'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="fld">
          <label className="lab" htmlFor="f-away">Away from the screen while they run</label>
          <select id="f-away" name="away" className="in" defaultValue="Sometimes">
            {['Rarely', 'Sometimes', 'Often', 'Most of the day'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <label className="check"><input type="checkbox" name="okToCall" /><span>OK to call me about the design.</span></label>
      <div className="hp" aria-hidden="true"><label htmlFor="f-web">Website</label><input id="f-web" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
      {error ? <p className="err" role="alert">{error}</p> : null}
      <div><button type="submit" className="pill" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Join the early list'}</button></div>
    </form>
  );
}
