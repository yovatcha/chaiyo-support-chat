import Link from 'next/link';
import Script from 'next/script';

export default function Home() {
  return (
    <main className="landing">
      <nav className="topbar">
        <span className="brand">🤖 Yo-bot</span>
        <div className="spacer" />
        <Link href="/login" className="btn secondary">Sign in</Link>
      </nav>

      <section className="hero">
        <h1>Add an AI support chat to any website.</h1>
        <p className="muted">
          Create a bot, paste what it should know, and drop one script tag on
          your site. That&apos;s it.
        </p>
        <Link href="/login" className="btn big">Create your bot</Link>
        <p className="muted small">
          The chat bubble in the corner is a live demo — it&apos;s the portfolio bot.
        </p>
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
