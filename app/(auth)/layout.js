import Brand from '@/components/Brand';

// Shared chrome for every auth screen: brand panel on the left, whichever
// form is active on the right. The (auth) group keeps the URLs flat —
// /login, /signup, /check-email, and so on.
export default function AuthLayout({ children }) {
  return (
    <main className="auth">
      <aside className="auth-brand">
        <div className="auth-grid" aria-hidden="true" />
        <Brand href="/" />

        <div className="auth-brand-body">
          <span className="mono-label">ACCESS · CONSOLE</span>
          <h2 className="auth-tagline">
            แชทซัพพอร์ต AI
            <br />
            สำหรับ<span>ทุกเว็บไซต์</span>
          </h2>
          <ul className="auth-points">
            <li><span className="mono-idx">[01]</span> ตั้งค่าเสร็จในไม่กี่นาที</li>
            <li><span className="mono-idx">[02]</span> สคริปต์บรรทัดเดียว ใช้ได้ทุกเฟรมเวิร์ก</li>
            <li><span className="mono-idx">[03]</span> หน้าตาตรงกับแบรนด์ของคุณ</li>
          </ul>
        </div>

        <div className="auth-blocks" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-form-wrap frame">{children}</div>
      </section>
    </main>
  );
}
