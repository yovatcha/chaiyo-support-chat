'use client';

// Catches anything thrown while rendering a dashboard page so a Supabase or
// network failure shows a retry instead of the framework's raw error page.
export default function DashboardError({ error, reset }) {
  return (
    <div>
      <h1>เกิดข้อผิดพลาด</h1>
      <p className="error">
        {error?.message || 'โหลดแดชบอร์ดไม่สำเร็จ ลองอีกครั้ง'}
      </p>
      <button type="button" className="btn" onClick={() => reset()}>
        ลองอีกครั้ง
      </button>
    </div>
  );
}
