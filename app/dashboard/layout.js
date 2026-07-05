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
        <Link href="/dashboard" className="brand">🤖 Yo-bot</Link>
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
