// Refreshes the Supabase auth session on every request and gates /dashboard.
// Fails OPEN: if auth isn't configured or anything throws, it passes the
// request through rather than 500-ing the whole site. The dashboard layout
// still enforces auth server-side, so protection isn't lost.

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  const passthrough = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return passthrough; // not configured — don't crash

  try {
    let response = passthrough;

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch {
    // Never let a middleware error take the site down.
    return passthrough;
  }
}
