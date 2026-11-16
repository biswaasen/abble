import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import Showcase from '@/components/Showcase';
import { LAUNCH_YEAR, PRICE } from '@/lib/launch';

export default function Home() {
  return (
    <>
      <Reveal />

      <main>
        <section id="top">
          <Showcase />
        </section>

        <section id="waitlist" className="waitlist">
          <div className="wrap center rv">
            <h2 className="h2">Be one of the first.</h2>
            <p className="launch">Launching in {LAUNCH_YEAR} at {PRICE}.</p>
            <a className="btn btn-lg waitlist-cta" href="/waitlist">Join the waitlist</a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
