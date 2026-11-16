import EarlyAccessButton from '@/components/EarlyAccessButton';
import Logo from '@/components/Logo';

export default function Nav() {
  return (
    <header className="nav">
      <nav className="navin" aria-label="Main">
        <a className="nav-logo" href="/#top" aria-label="Abble">
          <Logo />
        </a>
        <div className="navlinks">
          <a href="/#how">How it works</a>
          <a href="/#wear">Design</a>
          <a href="/story">Our story</a>
        </div>
        <EarlyAccessButton size="nav" />
      </nav>
    </header>
  );
}
