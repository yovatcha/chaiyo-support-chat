'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Keeps the Supabase session cookie fresh from the browser.
//
// Server Components cannot write cookies, so a token refresh that happens
// during a server render is lost — and there is no auth middleware here (it
// crashed on Vercel, see next.config.js). The browser client auto-refreshes
// the access token before it expires and writes the rotated tokens back to
// the cookie, so the server keeps seeing a valid session.
export default function SessionKeeper() {
  useEffect(() => {
    const supabase = createClient();
    // Reading the session once starts the auto-refresh timer and, if the
    // server just rotated the token during render, persists that rotation.
    supabase.auth.getSession().catch(() => {});
    const { data } = supabase.auth.onAuthStateChange(() => {});
    return () => data?.subscription?.unsubscribe();
  }, []);
  return null;
}
