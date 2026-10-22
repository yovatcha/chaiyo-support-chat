import Link from 'next/link';

// The Yo-bot wordmark: the four-stripe Chaiyo brandmark plus the name.
// Renders as a link when `href` is given, otherwise as a plain span.
export default function Brand({ href, className = '' }) {
  const inner = (
    <>
      <span className="brandmark" aria-hidden="true">
        <span className="s1" /><span className="s2" /><span className="s3" /><span className="s4" />
      </span>
      Yo-bot
    </>
  );
  const cls = ('brand ' + className).trim();
  return href ? <Link href={href} className={cls}>{inner}</Link> : <span className={cls}>{inner}</span>;
}
