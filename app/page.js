import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import Showcase from '@/components/Showcase';
import EarlyAccessButton from '@/components/EarlyAccessButton';
import PhotoBand from '@/components/PhotoBand';
import { LAUNCH_YEAR, PRICE } from '@/lib/launch';

const FAQ = [
  ['What is Abble 1?', 'A glass screen for your AI coding agents, about the size of an SD card. When one needs a decision, Abble 1 shows you the question. Tap or speak your answer, and the agent gets back to work.'],
  ['How much is Abble 1?', `The launch price is ${PRICE} for early members. Getting early access is free.`],
  ['When does it launch?', `Abble 1 launches in ${LAUNCH_YEAR}. Early members hear first.`],
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

        <section id="wear" className="sec center">
          <h2 className="h2">Pocket it.</h2>
          <div className="shot-hand rv"><img src="/img/hand.webp" width={1199} height={1312} loading="lazy" alt="Abble 1 held between thumb and fingers" /></div>
        </section>

        <section className="sec center bleed">
          <h2 className="h2">Or snap it on.</h2>
          <img className="shot shot-wrist rv" src="/img/wrist.webp" width={1672} height={941} loading="lazy" alt="Abble 1 worn on a black woven strap" />
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
            <p className="launch">Ships in {LAUNCH_YEAR}. Launch price {PRICE} for early members.</p>
            <EarlyAccessButton size="lg" />
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
