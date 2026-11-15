'use client';
import { useEffect } from 'react';

/* Fades and lifts each .rv element once, the first time it scrolls into view. */
export default function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('seen'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
