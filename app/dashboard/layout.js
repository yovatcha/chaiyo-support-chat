import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from './actions';
import SessionKeeper from '@/components/SessionKeeper';
import DashNav from '@/components/DashNav';

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="shell">
      <SessionKeeper />
      <DashNav email={user.email} signOut={signOut} />
      <main className="content">{children}</main>
    </div>
  );
}
