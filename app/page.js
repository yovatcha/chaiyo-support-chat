import Link from 'next/link';
import Script from 'next/script';
import Brand from '@/components/Brand';
import SiteNav from '@/components/SiteNav';
import ScrollHUD from '@/components/landing/ScrollHUD';
import Hero from '@/components/landing/Hero';
import What from '@/components/landing/What';
import How from '@/components/landing/How';
import HowToUse from '@/components/landing/HowToUse';
import Trust from '@/components/landing/Trust';

// Landing — one continuous story in chapters: 00 start → 01 what we do →
// 02 how it works → 03 how to use → 04 guardrails → 05 close.
export default function Home() {
  return (
    <main className="landing">
      <div className="grain" aria-hidden="true" />
      <SiteNav />
      <ScrollHUD />

      <Hero />
      <What />
      <How />
      <HowToUse />
      <Trust />

      <section className="close" data-hud="05|LAUNCH">
        <div className="close-grid" aria-hidden="true" />
        <div className="wrap close-inner">
          <span className="mono-label">05 — LAUNCH</span>
          <h2>
            พร้อมให้บอทของคุณ
            <br />
            <span className="hl">เริ่มทำงาน</span>แล้วหรือยัง
          </h2>
          <p>สมัครฟรี สร้างบอทตัวแรกได้ในไม่กี่นาที — ลองคุยกับบอทตัวอย่างที่มุมขวาล่าง</p>
          <div className="hero-cta">
            <Link href="/signup" className="btn big">สร้างบอทตัวแรก <span aria-hidden="true">→</span></Link>
            <Link href="/login" className="btn ghost big">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-inner">
          <Brand />
          <span className="mono-label">AI SUPPORT CHAT · GROQ · SUPABASE</span>
          <div className="spacer" />
          <span className="footer-copy">© 2026 Yo-bot</span>
        </div>
        <div className="footer-stripe" aria-hidden="true"><span /><span /><span /><span /></div>
      </footer>

      {/* Live demo of the embeddable widget, pointed at the seeded portfolio bot. */}
      <Script
        src="/yo-bot.js"
        data-bot="portfolio"
        data-bot-name="Yo-bot"
        data-lang="th"
        strategy="afterInteractive"
      />
    </main>
  );
}
