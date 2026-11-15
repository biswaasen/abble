import Hero3D from '@/components/Hero3D';
import EarlyForm from '@/components/EarlyForm';
import Reveal from '@/components/Reveal';

export default function Home() {
  return (
    <>
      <Reveal />
      <header className="nav">
        <nav className="navin" aria-label="Main">
          <a className="brand" href="#top">abble</a>
          <div className="navlinks">
            <a href="#question">How it works</a>
            <a href="#design">Design</a>
            <a href="#agents">Agents</a>
          </div>
          <a className="pills" href="#shape">Get early access</a>
        </nav>
      </header>

      <main>
        {/* 1 · hero */}
        <section id="top" className="center" style={{ padding: 'clamp(48px, 6vw, 88px) 24px 0' }}>
          <div className="wrap" style={{ maxWidth: 1200 }}>
            <h1 className="h1">Your agents.<br /><span className="tail">Within reach.</span></h1>
            <p className="lead">A quiet screen. One clear decision. A little more freedom to step away.</p>
            <div className="cta">
              <a className="pill" href="#shape">Help shape abble</a>
              <a className="link" href="#question">See how it works ›</a>
            </div>
            <Hero3D />
          </div>
        </section>

        {/* 2 · decide */}
        <section id="question" className="sec">
          <div className="wrap two">
            <div className="colt">
              <p className="eyebrow">Decide</p>
              <h2 className="hsuper hside">One question. <span className="tail">Back to your day.</span></h2>
              <p className="leadl">When an agent gets stuck, abble shows the one thing it needs from you. One line of context. Two clear answers.</p>
            </div>
            <div className="coli">
              <img className="ph rv" src="/img/04-upright-question.webp" width={1100} height={1375} loading="lazy" alt="abble held between two fingers, asking: Postgres or SQLite?" />
            </div>
          </div>
        </section>

        {/* 3 · carry */}
        <section className="sec">
          <div className="wrap two rev">
            <div className="colt">
              <p className="eyebrow">Carry</p>
              <h2 className="hsuper hside">A little more <span className="tail">freedom.</span></h2>
              <p className="leadl">Small enough to forget it is there. Make tea. Take the call. Step away from the desk. Your agents keep working, and abble tells you when one needs you.</p>
            </div>
            <div className="coli">
              <img className="ph rv" src="/img/05-upright-palm.webp" width={1100} height={1375} loading="lazy" alt="abble resting in an open palm, showing how small it is" />
            </div>
          </div>
        </section>

        {/* 4 · talk */}
        <section className="sec center">
          <div className="wrap">
            <p className="eyebrow">Talk</p>
            <h2 className="hsuper">Say what <span className="tail">comes next.</span></h2>
            <p className="lead">Hold the glass and speak. Let go to send. Your words go to the agent you chose.</p>
            <img className="ph rv mt" src="/img/08-voice.webp" width={1536} height={1024} loading="lazy" alt="Someone speaking to abble on their wrist while it shows Listening" />
          </div>
        </section>

        {/* 5 · smart steps */}
        <section id="steps" className="sec center">
          <div className="wrap">
            <p className="eyebrow">Smart steps</p>
            <h2 className="hsuper">Big questions. <span className="tail">Small steps.</span></h2>
            <p className="lead">A long question from your agent becomes a few short ones. Tap an answer, review, and send.</p>
            <div className="g3 mt">
              <figure className="fig rv">
                <img className="scr" src="/img/screen-steps.webp" width={1100} height={811} loading="lazy" alt="Screen: Where should it run? Atlas Cloud or Locally" />
                <figcaption className="fc">One short question <span>With an answer suggested for you.</span></figcaption>
              </figure>
              <figure className="fig rv">
                <img className="scr" src="/img/screen-review.webp" width={1100} height={811} loading="lazy" alt="Screen: Ready to send. Atlas, Mumbai, app-dev" />
                <figcaption className="fc">Review <span>Every answer on one screen.</span></figcaption>
              </figure>
              <figure className="fig rv">
                <img className="scr" src="/img/screen-sent.webp" width={1100} height={811} loading="lazy" alt="Screen: Back to work. Claude Code received your answer." />
                <figcaption className="fc">Back to work <span>Shown once your agent has it.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 6 · strap */}
        <section className="sec center">
          <div className="wrap">
            <p className="eyebrow">Strap</p>
            <h2 className="hsuper">Snap on. <span className="tail">Carry on.</span></h2>
            <p className="lead">Keep abble in a pocket, or snap it onto the optional woven strap. A magnet holds it in place.</p>
            <div className="g2 mt">
              <img className="ph rv" src="/img/07-wrist.webp" width={1400} height={933} loading="lazy" alt="abble worn on a black woven strap" />
              <img className="ph rv" src="/img/10-strap.webp" width={1400} height={933} loading="lazy" alt="abble lifting off the strap's magnetic cradle" />
            </div>
          </div>
        </section>

        {/* 7 · design (the one dark section) */}
        <section id="design" className="dark center">
          <div className="wrap">
            <p className="eyebrow">Design</p>
            <h2 className="hsuper">Every edge, <span className="tail">considered.</span></h2>
            <p className="lead">One block of space gray aluminium. One sheet of glass. Nothing to press.</p>
            <img className="ph rv mt" src="/img/09-macro.webp" width={1536} height={1024} loading="lazy" alt="Close-up of abble's glass meeting its aluminium edge" />
            <dl className="spx">
              <div><dt>38 × 28 × 5 mm</dt><dd>Smaller than a matchbox</dd></div>
              <div><dt>Aluminium</dt><dd>Space gray, one piece</dd></div>
              <div><dt>Glass</dt><dd>One continuous front</dd></div>
              <div><dt>USB-C</dt><dd>No buttons</dd></div>
            </dl>
          </div>
        </section>

        {/* 8 · agents */}
        <section id="agents" className="sec center">
          <div className="wrap">
            <p className="eyebrow">Planned integrations</p>
            <h2 className="hsuper">The agents <span className="tail">you already use.</span></h2>
            <ul className="icons">
              <li><img src="/brand/claude.png" width={88} height={88} alt="" />Claude Code</li>
              <li><img src="/brand/codex.png" width={88} height={88} alt="" />Codex</li>
              <li><img src="/brand/cursor.png" width={88} height={88} alt="" />Cursor</li>
              <li><img src="/brand/gemini-cli.png" width={88} height={88} alt="" />Gemini CLI</li>
            </ul>
            <img className="scr rv" src="/img/screen-idle.webp" width={1100} height={811} loading="lazy" alt="abble idle screen: 9:41, All clear, 3 working, four agents" style={{ maxWidth: 620, margin: 'clamp(40px, 5vw, 64px) auto 0' }} />
          </div>
        </section>

        {/* 9 · help shape abble */}
        <section id="shape" className="sec">
          <div className="wrap two" style={{ alignItems: 'flex-start', gap: 'clamp(32px, 6vw, 88px)' }}>
            <div className="colt" style={{ flex: '1 1 360px' }}>
              <h2 className="hsuper" style={{ fontSize: 'clamp(40px, 5vw, 68px)' }}>Help shape abble.</h2>
              <p className="leadl">We are finishing the design with a small group of early builders. Tell us how you work with agents. We may call you.</p>
            </div>
            <div style={{ flex: '1.2 1 480px', minWidth: 0 }}>
              <EarlyForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p className="fine">Images show a design concept. Size, display and strap may change before production. Agent names and icons belong to their owners and are shown as planned integrations.</p>
          <div className="row"><span className="brand" style={{ fontSize: 20 }}>abble</span><span className="fine">© 2026 abble</span></div>
        </div>
      </footer>
    </>
  );
}
