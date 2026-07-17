import Link from 'next/link';
import { resendConfirmation } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export const metadata = { title: 'Check your email — Yo-bot' };

export default async function CheckEmailPage({ searchParams }) {
  const params = await searchParams;
  const email = params?.email || '';
  const unconfirmed = params?.reason === 'unconfirmed';

  return (
    <>
      <div className="auth-icon" aria-hidden="true">✉</div>

      <header className="auth-head">
        <h1>{unconfirmed ? 'Confirm your email first' : 'Check your email'}</h1>
        <p className="muted small">
          {unconfirmed
            ? 'That account exists but hasn’t been confirmed yet. '
            : 'We sent a confirmation link to '}
          {email ? <strong>{email}</strong> : 'your inbox'}
          {unconfirmed
            ? '. Use the link we emailed you, or send a fresh one below.'
            : '. Opening it signs you straight in — no need to come back here.'}
        </p>
      </header>

      {params?.sent ? (
        <p className="ok">New link sent. It can take a minute to arrive.</p>
      ) : null}
      {params?.error ? <p className="error">{params.error}</p> : null}

      <form className="auth-form" action={resendConfirmation}>
        {email ? (
          <input type="hidden" name="email" value={email} />
        ) : (
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
          </label>
        )}

        <SubmitButton className="btn secondary full" pendingLabel="Sending…">
          Resend the link
        </SubmitButton>
      </form>

      <p className="auth-alt muted small">
        Already confirmed? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
