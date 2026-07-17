import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { updatePassword } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export const metadata = { title: 'Set a new password — Yo-bot' };

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;

  // Reachable only via the recovery link, which /auth/callback exchanges for a
  // session before redirecting here.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <header className="auth-head">
          <h1>This link has expired</h1>
          <p className="muted small">
            Password reset links are single-use and time-limited. Request a
            fresh one to continue.
          </p>
        </header>
        <p className="auth-alt muted small">
          <Link href="/forgot-password">Request a new link</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <header className="auth-head">
        <h1>Set a new password</h1>
        <p className="muted small">
          Choose a new password for <strong>{user.email}</strong>.
        </p>
      </header>

      {params?.error ? <p className="error">{params.error}</p> : null}

      <form className="auth-form" action={updatePassword}>
        <label>
          New password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoFocus
          />
        </label>

        <label>
          Confirm password
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Type it again"
            required
            minLength={8}
          />
        </label>

        <SubmitButton className="btn big full" pendingLabel="Saving…">
          Update password
        </SubmitButton>
      </form>
    </>
  );
}
