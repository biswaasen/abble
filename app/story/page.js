import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';

export const metadata = {
  title: 'Our story · abble',
  description: 'The new era of personalised computing, and why abble is design first.',
};

const ERAS = [
  ['1970s', 'We typed commands.'],
  ['1984', 'We pointed and clicked.'],
  ['2007', 'We touched glass.'],
  ['Now', 'Computers work for us.'],
];

export default function Story() {
  return (
    <>
      <Reveal />
      <Nav />

      <main>
        {/* opening */}
        <section className="story-hero">
          <p className="product">Our story</p>
          <h1 className="hero-title">The new era of<br />personalised computing.</h1>
        </section>

        {/* how we have talked to computers */}
        <section className="sec">
          <ol className="eras">
            {ERAS.map(([when, what]) => (
              <li key={when} className="rv">
                <span>{when}</span>
                <strong>{what}</strong>
              </li>
            ))}
          </ol>
        </section>

        {/* inspiration */}
        <section className="sec">
          <div className="wrap split flip">
            <img className="split-img rv" src="/img/06-upright-grip.webp" width={1122} height={1402} loading="lazy" alt="abble 1 held between thumb and fingers" />
            <div className="split-copy">
              <h2 className="h3">If it reminds you of Apple, good.</h2>
              <p className="lede">Our founder’s inspiration is Steve Jobs, who decided what people would need before they could ask for it, then made the engineering serve it. We work the same way. Design first. Engineering follows.</p>
            </div>
          </div>
        </section>

        {/* the rule */}
        <section className="quote">
          <figure className="jobs rv">
            <blockquote><p>“You’ve got to start with the customer experience and work backwards to the technology.”</p></blockquote>
            <figcaption>Steve Jobs, 1997</figcaption>
          </figure>
        </section>

        {/* where it starts */}
        <section className="sec final">
          <div className="final-photo tight">
            <div className="final-belief">
              <h2 className="h2"><a className="big-link" href="/">Meet abble 1 <span aria-hidden="true">→</span></a></h2>
            </div>
            <img className="final-img" src="/img/03-hero.webp" width={1536} height={1024} loading="lazy" alt="abble 1 on a white surface, showing the time and four coding agents" />
          </div>
        </section>
      </main>

      <Footer tint />
    </>
  );
}
