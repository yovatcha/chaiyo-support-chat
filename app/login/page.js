import { login, signup } from './actions';

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="auth">
      <form className="card">
        <h1>Yo-bot platform</h1>
        <p className="muted small">Sign in, or create an account to build your first bot.</p>

        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required minLength={6} />
        </label>

        {error ? <p className="error">{error}</p> : null}

        <div className="row">
          <button className="btn" formAction={login}>Sign in</button>
          <button className="btn secondary" formAction={signup}>Sign up</button>
        </div>
      </form>
    </main>
  );
}
