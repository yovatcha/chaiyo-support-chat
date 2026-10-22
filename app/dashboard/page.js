import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardHome({ searchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // layout redirects; just don't query

  const { data: bots, error } = await supabase
    .from('bots')
    .select('id, bot_name, public_id, updated_at, accent_color, allowed_origins')
    .eq('owner', user.id)
    .order('updated_at', { ascending: false });
  if (error) throw new Error('โหลดรายการบอทไม่สำเร็จ');

  return (
    <div>
      <div className="pagehead">
        <div>
          <span className="mono-label">01 — BOTS</span>
          <h1>บอทของคุณ</h1>
        </div>
        <Link className="btn" href="/dashboard/bots/new">+ สร้างบอท</Link>
      </div>
      {sp?.deleted ? <p className="ok">ลบบอทแล้ว</p> : null}
      {sp?.error ? <p className="error">{sp.error}</p> : null}

      {!bots || bots.length === 0 ? (
        <div className="empty frame">
          <span className="mono-label">NO BOTS YET</span>
          <h2>สร้างบอทตัวแรก</h2>
          <p className="muted">กำหนดบุคลิก ใส่ความรู้ แล้ววางสคริปต์บนเว็บไซต์ — ใช้เวลาเพียงไม่กี่นาที</p>
          <Link className="btn big" href="/dashboard/bots/new">+ สร้างบอท</Link>
        </div>
      ) : (
        <ul className="bots">
          {bots.map((b) => {
            const origins = (b.allowed_origins || []).length;
            return (
              <li key={b.id}>
                <Link href={'/dashboard/bots/' + b.id} className="bot-card frame">
                  <span className="bot-card-top">
                    <span className="bot-swatch" style={{ background: b.accent_color || 'var(--red)' }} aria-hidden="true" />
                    <span className="status"><span className="pulse" /> LIVE</span>
                  </span>
                  <strong>{b.bot_name || 'บอทยังไม่มีชื่อ'}</strong>
                  <code className="bot-id">{b.public_id}</code>
                  <span className="bot-meta">
                    <span>{origins ? `${origins} โดเมน` : 'ทุกโดเมน'}</span>
                    <span>{new Date(b.updated_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </span>
                  <span className="bot-card-go" aria-hidden="true">แก้ไข →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
