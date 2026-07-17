import Link from 'next/link';
import { login } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export const metadata = { title: 'Sign in — Yo-bot' };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <header className="auth-head">
        <h1>Welcome back</h1>
        <p className="muted small">Sign in to manage your bots.</p>
      </header>

      {params?.notice ? <p className="ok">{params.notice}</p> : null}
      {params?.error ? <p className="error">{params.error}</p> : null}

      <form className="auth-form" action={login}>
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
          <span className="label-row">
            Password
            <Link href="/forgot-password" className="label-link">Forgot?</Link>
          </span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </label>

        <SubmitButton className="btn big full" pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <p className="auth-alt muted small">
        New here? <Link href="/signup">Create an account</Link>
      </p>
    </>
  );
}
