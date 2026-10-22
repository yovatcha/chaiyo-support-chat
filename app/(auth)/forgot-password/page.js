import Link from 'next/link';
import { requestPasswordReset } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export const metadata = { title: 'ตั้งรหัสผ่านใหม่ — Yo-bot' };

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;

  if (params?.sent) {
    return (
      <>
        <div className="auth-icon" aria-hidden="true">✉</div>
        <header className="auth-head">
          <h1>ตรวจสอบอีเมลของคุณ</h1>
          <p className="muted small">
            หากมีบัญชีที่ใช้
            {' '}{params?.email ? <strong>{params.email}</strong> : 'อีเมลนี้'}
            {' '}เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ ลิงก์ใช้ได้ 1 ชั่วโมง
          </p>
        </header>
        <p className="auth-alt muted small">
          <Link href="/login">กลับไปเข้าสู่ระบบ</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <header className="auth-head">
        <h1>ลืมรหัสผ่าน</h1>
        <p className="muted small">
          กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้
        </p>
      </header>

      <form className="auth-form" action={requestPasswordReset}>
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

        <SubmitButton className="btn big full" pendingLabel="กำลังส่ง…">
          ส่งลิงก์ตั้งรหัสผ่านใหม่
        </SubmitButton>
      </form>

      <p className="auth-alt muted small">
        นึกรหัสผ่านได้แล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
      </p>
    </>
  );
}
