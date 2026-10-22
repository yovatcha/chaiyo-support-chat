import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { updatePassword } from '../actions';
import SubmitButton from '@/components/SubmitButton';

export const metadata = { title: 'ตั้งรหัสผ่านใหม่ — Yo-bot' };

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;

  // Reachable only via the recovery link, which /auth/callback exchanges for a
  // session before redirecting here.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <header className="auth-head">
          <h1>ลิงก์นี้หมดอายุแล้ว</h1>
          <p className="muted small">
            ลิงก์ตั้งรหัสผ่านใช้ได้ครั้งเดียวและมีเวลาจำกัด
            ขอลิงก์ใหม่เพื่อดำเนินการต่อ
          </p>
        </header>
        <p className="auth-alt muted small">
          <Link href="/forgot-password">ขอลิงก์ใหม่</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <header className="auth-head">
        <h1>ตั้งรหัสผ่านใหม่</h1>
        <p className="muted small">
          ตั้งรหัสผ่านใหม่สำหรับ <strong>{user.email}</strong>
        </p>
      </header>

      {params?.error ? <p className="error">{params.error}</p> : null}

      <form className="auth-form" action={updatePassword}>
        <label>
          รหัสผ่านใหม่
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            required
            minLength={8}
            autoFocus
          />
        </label>

        <label>
          ยืนยันรหัสผ่าน
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="พิมพ์รหัสผ่านอีกครั้ง"
            required
            minLength={8}
          />
        </label>

        <SubmitButton className="btn big full" pendingLabel="กำลังบันทึก…">
          บันทึกรหัสผ่าน
        </SubmitButton>
      </form>
    </>
  );
}
