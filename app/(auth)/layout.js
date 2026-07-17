import Link from 'next/link';

// Shared chrome for every auth screen: brand panel on the left, whichever
// form is active on the right. The (auth) group keeps the URLs flat —
// /login, /signup, /check-email, and so on.
export default function AuthLayout({ children }) {
  return (
    <main className="auth">
      <aside className="auth-brand">
        <Link href="/" className="brand">
          <span className="brandmark" aria-hidden="true">
            <span className="s1" /><span className="s2" /><span className="s3" /><span className="s4" />
          </span>
          Yo-bot
        </Link>

        <div className="auth-brand-body">
          <h2 className="auth-tagline">
            Add AI support chat to <span>any website.</span>
          </h2>
          <ul className="auth-points">
            <li>
              <span className="auth-point-dot" style={{ background: 'var(--blue)' }} />
              Set up in minutes
            </li>
            <li>
              <span className="auth-point-dot" style={{ background: 'var(--red)' }} />
              One script tag, any framework
            </li>
            <li>
              <span className="auth-point-dot" style={{ background: 'var(--gold)' }} />
              Branded to match your site
            </li>
          </ul>
        </div>

        <div className="auth-blocks" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-form-wrap">{children}</div>
      </section>
    </main>
  );
}
