import Link from 'next/link';

// The Yo-bot wordmark: the Chaiyo four-stripe speech bubble (with bot eyes on
// the red band) plus the name. Mirrors public/brand/yo-bot-mark.svg.
// Renders as a link when `href` is given, otherwise as a plain span.
export function BrandMark({ className = 'brandmark' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path fill="var(--gold)" d="M6 3h20a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4H13l-6 5v-5H6a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z" />
      <path fill="var(--cream)" d="M6 3h20a4 4 0 0 1 4 4v1.5H2V7a4 4 0 0 1 4-4Z" />
      <rect fill="var(--red)" x="2" y="8.25" width="28" height="5.5" />
      <rect fill="var(--yellow)" x="2" y="13.5" width="28" height="5.25" />
      <rect fill="var(--cream)" x="10.4" y="9.6" width="2.6" height="2.6" rx=".6" />
      <rect fill="var(--cream)" x="19" y="9.6" width="2.6" height="2.6" rx=".6" />
    </svg>
  );
}

export default function Brand({ href, className = '' }) {
  const inner = (
    <>
      <BrandMark />
      <span>Yo<span className="brand-dash">-</span>bot</span>
    </>
  );
  const cls = ('brand ' + className).trim();
  return href ? <Link href={href} className={cls}>{inner}</Link> : <span className={cls}>{inner}</span>;
}
