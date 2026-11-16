export default function PhotoBand({ id, children }) {
  return (
    <div id={id} className="photo-band">
      <div className="photo-band-copy">{children}</div>
      <img className="photo-band-img" src="/img/hero.webp" width={1535} height={1024} loading="lazy" alt="abble 1 on a white surface, showing the time and four coding agents" />
    </div>
  );
}
