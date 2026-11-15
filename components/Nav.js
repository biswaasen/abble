import EarlyButton from '@/components/EarlyButton';

export default function Nav() {
  return (
    <header className="nav">
      <nav className="navin" aria-label="Main">
        <a className="brand" href="/#top">abble</a>
        <div className="navlinks">
          <a href="/#how">How it works</a>
          <a href="/#design">Design</a>
          <a href="/story">Our story</a>
        </div>
        <EarlyButton size="nav" />
      </nav>
    </header>
  );
}
