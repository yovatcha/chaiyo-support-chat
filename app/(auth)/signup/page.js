import Link from 'next/link';
import { signup } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export const metadata = { title: 'Create an account — Yo-bot' };

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <header className="auth-head">
        <h1>Create your account</h1>
        <p className="muted small">Build your first bot in a couple of minutes.</p>
      </header>

      {params?.error ? <p className="error">{params.error}</p> : null}

      <form className="auth-form" action={signup}>
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

        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
          <span className="hint muted small">
            We’ll email you a link to confirm the address.
          </span>
        </label>

        <SubmitButton className="btn big full" pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </form>

      <p className="auth-alt muted small">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
