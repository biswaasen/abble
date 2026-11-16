export default function PreorderButton({ size = 'nav' }) {
  return (
    <a className={`btn btn-${size}`} href="/form">
      Pre-order
    </a>
  );
}
