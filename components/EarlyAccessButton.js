export default function EarlyAccessButton({ size = 'nav' }) {
  return (
    <a className={`btn btn-${size}`} href="/form">
      Get early access
    </a>
  );
}
