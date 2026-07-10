import Link from 'next/link';
import Script from 'next/script';

export default function Home() {
  return (
    <main className="landing">
      <nav className="topbar">
        <span className="brand">
          <span className="brandmark" aria-hidden="true">
            <span className="s1" /><span className="s2" /><span className="s3" /><span className="s4" />
          </span>
          Yo-bot
        </span>
        <div className="spacer" />
        <Link href="/login" className="btn secondary">Sign in</Link>
      </nav>

      <section className="hero">
        <span className="eyebrow">AI support, on-brand</span>
        <h1>
          Add an AI support chat to <span className="accent">any website.</span>
        </h1>
        <p className="muted">
          Create a bot, paste what it should know, and drop one script tag on
          your site. That&apos;s it.
        </p>
        <Link href="/login" className="btn big">Create your bot</Link>
        <p className="muted small">
          The chat bubble in the corner is a live demo — it&apos;s the portfolio bot.
        </p>
      </section>

      <section className="features">
        <div className="feature">
          <div className="dot" style={{ background: 'var(--blue)' }} />
          <h3>Set it up in minutes</h3>
          <p>Describe the persona, paste your knowledge, and you&apos;re live.</p>
        </div>
        <div className="feature">
          <div className="dot" style={{ background: 'var(--red)' }} />
          <h3>One script tag</h3>
          <p>Drop a single line into any page — no framework required.</p>
        </div>
        <div className="feature">
          <div className="dot" style={{ background: 'var(--gold)' }} />
          <h3>Made yours</h3>
          <p>Colour templates and branding to match your site&apos;s identity.</p>
        </div>
      </section>

      {/* Live demo of the embeddable widget, pointed at the seeded portfolio bot. */}
      <Script
        src="/yo-bot.js"
        data-bot="portfolio"
        data-bot-name="Yo-bot"
        strategy="afterInteractive"
      />
    </main>
  );
}
