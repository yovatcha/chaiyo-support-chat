import Link from 'next/link';
import { resendConfirmation } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export const metadata = { title: 'ยืนยันอีเมล — Yo-bot' };

export default async function CheckEmailPage({ searchParams }) {
  const params = await searchParams;
  const email = params?.email || '';
  const unconfirmed = params?.reason === 'unconfirmed';

  return (
    <>
      <div className="auth-icon" aria-hidden="true">✉</div>

      <header className="auth-head">
        <h1>{unconfirmed ? 'ยืนยันอีเมลก่อนเข้าใช้' : 'ตรวจสอบอีเมลของคุณ'}</h1>
        <p className="muted small">
          {unconfirmed
            ? 'บัญชีนี้ยังไม่ได้ยืนยันอีเมล เปิดลิงก์ที่เราส่งไปยัง '
            : 'เราส่งลิงก์ยืนยันไปที่ '}
          {email ? <strong>{email}</strong> : 'กล่องจดหมายของคุณ'}
          {unconfirmed
            ? ' หรือกดส่งลิงก์ใหม่ด้านล่าง'
            : ' เปิดลิงก์แล้วเข้าใช้ได้เลย ไม่ต้องกลับมาหน้านี้'}
        </p>
      </header>

      {params?.sent ? (
        <p className="ok">ส่งลิงก์ใหม่แล้ว อาจใช้เวลาสักครู่จึงจะถึง</p>
      ) : null}
      {params?.error ? <p className="error">{params.error}</p> : null}

      <form className="auth-form" action={resendConfirmation}>
        {email ? (
          <input type="hidden" name="email" value={email} />
        ) : (
          <label>
            อีเมล
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
          </label>
        )}

        <SubmitButton className="btn secondary full" pendingLabel="กำลังส่ง…">
          ส่งลิงก์อีกครั้ง
        </SubmitButton>
      </form>

      <p className="auth-alt muted small">
        ยืนยันแล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
      </p>
    </>
  );
}
