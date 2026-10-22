import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div>
      <h1>ไม่พบบอท</h1>
      <p className="muted">
        บอทนี้ไม่มีอยู่ หรือไม่ใช่บอทในบัญชีของคุณ
      </p>
      <Link className="btn" href="/dashboard">กลับไปรายการบอท</Link>
    </div>
  );
}
