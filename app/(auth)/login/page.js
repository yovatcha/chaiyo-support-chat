import Link from 'next/link';
import { login } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export const metadata = { title: 'เข้าสู่ระบบ — Yo-bot' };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <header className="auth-head">
        <h1>ยินดีต้อนรับกลับ</h1>
        <p className="muted small">เข้าสู่ระบบเพื่อจัดการบอทของคุณ</p>
      </header>

      {params?.notice ? <p className="ok">{params.notice}</p> : null}
      {params?.error ? <p className="error">{params.error}</p> : null}

      <form className="auth-form" action={login}>
        <label>
          อีเมล
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
            รหัสผ่าน
            <Link href="/forgot-password" className="label-link">ลืมรหัสผ่าน?</Link>
          </span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </label>

        <SubmitButton className="btn big full" pendingLabel="กำลังเข้าสู่ระบบ…">
          เข้าสู่ระบบ
        </SubmitButton>
      </form>

      <p className="auth-alt muted small">
        ยังไม่มีบัญชี? <Link href="/signup">สมัครบัญชี</Link>
      </p>
    </>
  );
}
