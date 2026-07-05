import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: bots } = await supabase
    .from('bots')
    .select('id, bot_name, public_id, updated_at')
    .order('updated_at', { ascending: false });

  return (
    <div>
      <div className="pagehead">
        <h1>Your bots</h1>
        <Link className="btn" href="/dashboard/bots/new">+ New bot</Link>
      </div>

      {!bots || bots.length === 0 ? (
        <p className="muted" style={{ marginTop: 18 }}>
          No bots yet. Create your first one — it takes a minute.
        </p>
      ) : (
        <ul className="bots">
          {bots.map((b) => (
            <li key={b.id}>
              <Link href={'/dashboard/bots/' + b.id}>
                <strong>{b.bot_name}</strong>
                <span className="muted small"> · {b.public_id}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
