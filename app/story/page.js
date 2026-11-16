import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import PhotoBand from '@/components/PhotoBand';

const CHAPTERS = [
  ['We started by typing commands.', 'We pointed and clicked.', 'We touched glass.', 'Now, computers work for us.'],
  ['Our founder is inspired by Steve Jobs.', 'Design first.', 'Engineering follows.'],
  ['If it reminds you of Apple, good.'],
];

export default function Story() {
  return (
    <>
      <Reveal />
      <Nav />

      <main>
        <section className="story-ch story-open">
          <p className="product">Our story</p>
          <h1 className="story-line">The new era of<br />personalised computing.</h1>
        </section>

        {CHAPTERS.map((lines) => (
          <section key={lines[0]} className="story-ch rv">
            {lines.map((line) => <p key={line} className="story-line">{line}</p>)}
          </section>
        ))}

        <section className="story-end">
          <PhotoBand>
            <h2 className="story-line"><a className="big-link" href="/">Meet abble 1 <span aria-hidden="true">→</span></a></h2>
          </PhotoBand>
        </section>
      </main>

      <Footer />
    </>
  );
}
