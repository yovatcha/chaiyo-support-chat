// Supabase client for SERVER components, server actions, and route handlers.
// Reads/writes the user's session from cookies, so all queries run as the
// logged-in user and row-level security applies.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component (cookies are read-only there).
            // Safe to ignore — middleware refreshes the session.
          }
        },
      },
    }
  );
}
