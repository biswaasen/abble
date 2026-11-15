import Device3D from '@/components/Device3D';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import HowItWorks from '@/components/HowItWorks';
import EarlyButton, { Launch } from '@/components/EarlyButton';
import { LAUNCH_YEAR } from '@/lib/launch';

const FAQ = [
  ['What is abble 1?', 'A glass screen for your AI coding agents, about the size of an SD card. When one needs a decision, abble 1 shows you the question. Tap or speak your answer, and the agent gets back to work.'],
  ['When does it launch?', `abble 1 launches in ${LAUNCH_YEAR}. Early access members hear first.`],
  ['What does early access cost?', 'Nothing. Tell us how you work with agents and we will keep you posted.'],
  ['Which agents will it work with?', 'We are designing around Claude Code, Codex, Cursor and Gemini CLI. These are planned integrations, not finished ones.'],
  ['Do I have to wear it?', 'No. Keep it in a pocket, or snap it onto the optional woven strap.'],
  ['Are these photos of the real device?', 'Not yet. The images show a design concept. Size, display and strap may change before production.'],
];

export default function Home() {
  return (
    <>
      <Reveal />
      <Nav />

      <main>
        {/* hero */}
        <section id="top" className="hero">
          <p className="product">abble 1</p>
          <h1 className="hero-title">The ultimate interface<br />for the agentic era.</h1>
          <Device3D autoplay fit={0.96} className="hero-stage" />
        </section>

        {/* how it works, then the hardware: one pinned 3D abble 1 driven by scroll */}
        <section id="how" className="sec">
          <h2 className="h2 center">Ask. Answer. Back to work.</h2>
          <HowItWorks />
        </section>

        {/* size */}
        <section id="size" className="sec">
          <div className="wrap">
            <h2 className="h2 center">About the size of an SD card.</h2>
            <div className="trio">
              <img className="rv" src="/img/06-upright-grip.webp" width={1122} height={1402} loading="lazy" alt="abble 1 held between thumb and fingers, showing the time and four agents" />
              <img className="rv" src="/img/04-upright-question.webp" width={1122} height={1402} loading="lazy" alt="abble 1 pinched between two fingers, asking: Postgres or SQLite?" />
              <img className="rv" src="/img/05-upright-palm.webp" width={1122} height={1402} loading="lazy" alt="abble 1 resting in an open palm" />
            </div>
          </div>
        </section>

        {/* wear */}
        <section id="wear" className="sec">
          <div className="wrap center">
            <h2 className="h2">Pocket it. Or snap it on.</h2>
          </div>
          <img className="wide rv" src="/img/07-wrist.webp" width={1536} height={1024} loading="lazy" alt="abble 1 worn on a black woven strap" />
        </section>

        {/* faq */}
        <section id="faq" className="sec">
          <div className="wrap-narrow">
            <h2 className="h2 center">Questions.</h2>
            <div className="faq">
              {FAQ.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* final call */}
        <section id="final" className="sec final">
          <div className="wrap center">
            <h2 className="h2">Be one of the first 100.</h2>
            <Launch />
            <EarlyButton size="lg" />
          </div>
          <div id="belief" className="final-photo">
            <div className="final-belief">
              <h2 className="h2">Design first.<br />Engineering follows.</h2>
              <a className="btn-text belief-link" href="/story">Read our story <span aria-hidden="true">→</span></a>
            </div>
            <img className="final-img" src="/img/03-hero.webp" width={1536} height={1024} loading="lazy" alt="abble 1 on a white surface, showing the time and four coding agents" />
          </div>
        </section>
      </main>

      <Footer tint />
    </>
  );
}
