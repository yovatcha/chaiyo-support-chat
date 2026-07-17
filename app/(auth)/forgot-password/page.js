import Link from 'next/link';
import { requestPasswordReset } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export const metadata = { title: 'Reset your password — Yo-bot' };

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;

  if (params?.sent) {
    return (
      <>
        <div className="auth-icon" aria-hidden="true">✉</div>
        <header className="auth-head">
          <h1>Check your email</h1>
          <p className="muted small">
            If {params?.email ? <strong>{params.email}</strong> : 'that address'} has
            an account, a password reset link is on its way. The link expires in
            an hour.
          </p>
        </header>
        <p className="auth-alt muted small">
          <Link href="/login">Back to sign in</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <header className="auth-head">
        <h1>Reset your password</h1>
        <p className="muted small">
          Enter your email and we’ll send you a link to set a new one.
        </p>
      </header>

      <form className="auth-form" action={requestPasswordReset}>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            defaultValue={params?.email || ''}
            required
            autoFocus
          />
        </label>

        <SubmitButton className="btn big full" pendingLabel="Sending…">
          Send reset link
        </SubmitButton>
      </form>

      <p className="auth-alt muted small">
        Remembered it? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
