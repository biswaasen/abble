export default function EarlyButton({ size = 'nav' }) {
  return (
    <a className={`btn btn-${size}`} href="/form">
      Get early access
    </a>
  );
}
