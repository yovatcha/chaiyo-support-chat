import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from './actions';

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/dashboard" className="brand">
          <span className="brandmark" aria-hidden="true">
            <span className="s1" /><span className="s2" /><span className="s3" /><span className="s4" />
          </span>
          Yo-bot
        </Link>
        <div className="spacer" />
        <span className="muted small">{user.email}</span>
        <form action={signOut}>
          <button className="link">Sign out</button>
        </form>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
