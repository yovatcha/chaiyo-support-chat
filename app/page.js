import Link from 'next/link';
import Script from 'next/script';

export default function Home() {
  return (
    <main className="landing">
      {/* ── BAND 1 — dark hero. Nav rides over it, the red pill anchors it. ── */}
      <div className="band band--dark">
        <nav className="topbar topbar--over">
          <span className="brand">
            <span className="brandmark" aria-hidden="true">
              <span className="s1" /><span className="s2" /><span className="s3" /><span className="s4" />
            </span>
            Yo-bot
          </span>
          <div className="spacer" />
          <Link href="/login" className="btn ghost">Sign in</Link>
        </nav>

        <section className="hero">
          <span className="eyebrow">
            <span className="eb-dot" aria-hidden="true" />
            AI support, on-brand
          </span>
          <h1>
            Add an AI support chat to <span className="accent">any website.</span>
          </h1>
          <p className="lead">
            Create a bot, paste what it should know, and drop one script tag on
            your site. That&apos;s it.
          </p>
          <div className="hero-cta">
            <Link href="/signup" className="btn big">Create your bot</Link>
            <Link href="/login" className="btn ghost big">Sign in</Link>
          </div>
          <p className="small hero-note">
            The chat bubble in the corner is a live demo — it&apos;s the portfolio bot.
          </p>
        </section>
      </div>

      {/* ── BAND 2 — warm light body: features + the mono embed showcase. ── */}
      <div className="band band--light">
        <section className="section-head">
          <h2>Everything you need to go live</h2>
          <p>No framework, no build step, no design work — just your knowledge and one line of HTML.</p>
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

        <section className="showcase">
          <div className="showcase-inner">
            <div className="showcase-copy">
              <h3>Ship it with one line</h3>
              <p>
                Paste this once, anywhere in your page. The bubble, the chat window,
                and your bot&apos;s knowledge come along with it.
              </p>
            </div>
            <pre className="code-strip">
              <span className="tok-tag">&lt;script</span> <span className="tok-attr">src</span>=<span className="tok-str">&quot;/yo-bot.js&quot;</span>{'\n'}
              {'        '}<span className="tok-attr">data-bot</span>=<span className="tok-str">&quot;your-bot&quot;</span>{'\n'}
              {'        '}<span className="tok-attr">defer</span><span className="tok-tag">&gt;&lt;/script&gt;</span>
            </pre>
          </div>
        </section>
      </div>

      {/* ── BAND 3 — dark close: the red pill returns above the footer. ── */}
      <div className="band band--dark">
        <section className="close">
          <h2>Start building your support bot</h2>
          <p>Free to try. Live on your site in the time it takes to read your own FAQ.</p>
          <Link href="/signup" className="btn big">Create your bot</Link>
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <span className="brand">
              <span className="brandmark" aria-hidden="true">
                <span className="s1" /><span className="s2" /><span className="s3" /><span className="s4" />
              </span>
              Yo-bot
            </span>
            <div className="spacer" />
            <span>© 2026 Yo-bot · AI support chat</span>
          </div>
        </footer>
      </div>

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
