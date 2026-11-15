import { TAKEN, TOTAL, LAUNCH_YEAR } from '@/lib/launch';

export default function EarlyButton({ size = 'nav', count = true, className = '', ...rest }) {
  return (
    <a className={`btn btn-${size} ${className}`} href="/form" {...rest}>
      Get early access
      {count ? <span className="btn-count" aria-label={`${TAKEN} of ${TOTAL} spots taken`}>{TAKEN}/{TOTAL}</span> : null}
    </a>
  );
}

export function Launch() {
  return <p className="launch">Launching in {LAUNCH_YEAR}.</p>;
}
