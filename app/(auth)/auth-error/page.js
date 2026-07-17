import Link from 'next/link';

export const metadata = { title: 'Link problem — Yo-bot' };

export default async function AuthErrorPage({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <div className="auth-icon auth-icon--warn" aria-hidden="true">!</div>

      <header className="auth-head">
        <h1>That link didn’t work</h1>
        <p className="muted small">
          Confirmation links are single-use and expire. If you’ve already
          opened this one, just sign in.
        </p>
      </header>

      {params?.reason ? <p className="error">{params.reason}</p> : null}

      <div className="auth-actions">
        <Link href="/login" className="btn full">Sign in</Link>
        <Link href="/check-email" className="btn secondary full">
          Send a new confirmation link
        </Link>
      </div>
    </>
  );
}
