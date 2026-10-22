import Link from 'next/link';

export const metadata = { title: 'ลิงก์ใช้ไม่ได้ — Yo-bot' };

export default async function AuthErrorPage({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <div className="auth-icon auth-icon--warn" aria-hidden="true">!</div>

      <header className="auth-head">
        <h1>เปิดลิงก์ไม่สำเร็จ</h1>
        <p className="muted small">
          ลิงก์ยืนยันใช้ได้ครั้งเดียวและมีวันหมดอายุ
          หากเปิดลิงก์นี้ไปแล้ว ให้ลองเข้าสู่ระบบ
        </p>
      </header>

      {params?.reason ? <p className="error">{params.reason}</p> : null}

      <div className="auth-actions">
        <Link href="/login" className="btn full">เข้าสู่ระบบ</Link>
        <Link href="/check-email" className="btn secondary full">
          ส่งลิงก์ยืนยันใหม่
        </Link>
      </div>
    </>
  );
}
