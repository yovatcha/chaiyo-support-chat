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
    .select('id, bot_name, public_id, updated_at')
    .eq('owner', user.id)
    .order('updated_at', { ascending: false });
  if (error) throw new Error('Could not load your bots.');

  return (
    <div>
      <div className="pagehead">
        <h1>Your bots</h1>
        <Link className="btn" href="/dashboard/bots/new">+ New bot</Link>
      </div>
      {sp?.deleted ? <p className="ok">Bot deleted.</p> : null}
      {sp?.error ? <p className="error">{sp.error}</p> : null}

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
