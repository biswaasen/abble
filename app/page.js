import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import Showcase from '@/components/Showcase';
import EarlyButton from '@/components/EarlyButton';
import PhotoBand from '@/components/PhotoBand';
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
        <section id="top">
          <Showcase />
        </section>

        <section id="wear" className="sec">
          <div className="wrap center">
            <h2 className="h2">Pocket it. Or snap it on.</h2>
          </div>
          <div className="pair">
            <img className="rv" src="/img/hand.webp" width={1199} height={1312} loading="lazy" alt="abble 1 held between thumb and fingers" />
            <img className="rv" src="/img/wrist.webp" width={1535} height={1024} loading="lazy" alt="abble 1 worn on a black woven strap" />
          </div>
        </section>

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

        <section id="final" className="sec">
          <div className="wrap center">
            <h2 className="h2">Be one of the first 100.</h2>
            <p className="launch">Launching in {LAUNCH_YEAR}.</p>
            <EarlyButton size="lg" />
          </div>
          <PhotoBand id="belief">
            <h2 className="h2">Design first.<br />Engineering follows.</h2>
            <a className="text-link" href="/story">Read our story <span aria-hidden="true">→</span></a>
          </PhotoBand>
        </section>
      </main>

      <Footer />
    </>
  );
}
