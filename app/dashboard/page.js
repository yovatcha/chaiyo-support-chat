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
  if (error) throw new Error('Could not load your bots.');

  return (
    <div>
      <div className="pagehead">
        <div>
          <span className="mono-label">01 — BOTS</span>
          <h1>Your bots</h1>
        </div>
        <Link className="btn" href="/dashboard/bots/new">+ New bot</Link>
      </div>
      {sp?.deleted ? <p className="ok">Bot deleted.</p> : null}
      {sp?.error ? <p className="error">{sp.error}</p> : null}

      {!bots || bots.length === 0 ? (
        <div className="empty frame">
          <span className="mono-label">NO BOTS YET</span>
          <h2>Create your first bot</h2>
          <p className="muted">Give it a persona, paste what it should know, and embed it with one script tag. It takes a minute.</p>
          <Link className="btn big" href="/dashboard/bots/new">+ New bot</Link>
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
                  <strong>{b.bot_name || 'Untitled bot'}</strong>
                  <code className="bot-id">{b.public_id}</code>
                  <span className="bot-meta">
                    <span>{origins ? `${origins} origin${origins > 1 ? 's' : ''}` : 'any origin'}</span>
                    <span>{new Date(b.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </span>
                  <span className="bot-card-go" aria-hidden="true">Edit →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
