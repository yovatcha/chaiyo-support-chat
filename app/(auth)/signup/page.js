import Link from 'next/link';
import { signup } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export const metadata = { title: 'สมัครบัญชี — Yo-bot' };

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <header className="auth-head">
        <h1>สมัครบัญชี</h1>
        <p className="muted small">เริ่มสร้างบอทตัวแรกได้ในไม่กี่นาที</p>
      </header>

      {params?.error ? <p className="error">{params.error}</p> : null}

      <form className="auth-form" action={signup}>
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
          รหัสผ่าน
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            required
            minLength={8}
          />
          <span className="hint muted small">
            หากบัญชีต้องยืนยันอีเมล เราจะส่งลิงก์ไปที่อีเมลนี้
          </span>
        </label>

        <SubmitButton className="btn big full" pendingLabel="กำลังสมัครบัญชี…">
          สมัครบัญชี
        </SubmitButton>
      </form>

      <p className="auth-alt muted small">
        มีบัญชีอยู่แล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
      </p>
    </>
  );
}
