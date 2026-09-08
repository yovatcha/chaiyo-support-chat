// Shared auth helpers: figuring out where we're running, and turning the
// token in a Supabase email link into a real session.

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * Absolute origin of the running site, used to build the links we put in
 * confirmation emails.
 *
 * Without this, signUp() falls back to the Site URL configured in the
 * Supabase dashboard — which is how every confirmation link ended up
 * pointing at localhost:3000 regardless of where the user actually signed up.
 *
 * Set NEXT_PUBLIC_SITE_URL in production. The header fallback keeps local dev
 * and preview deployments working with no configuration.
 */
export async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, '');

  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  if (host) {
    const proto =
      h.get('x-forwarded-proto') ||
      (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
    return `${proto}://${host}`;
  }

  return h.get('origin') || 'http://localhost:3000';
}

/**
 * Only ever redirect to a path on this site — never to a URL an attacker
 * appended to the link.
 */
export function safeNext(next, fallback = '/dashboard') {
  if (typeof next !== 'string' || !next) return fallback;
  // A plain absolute path only. "//host", "/\host", control characters and
  // anything else the URL parser could resolve to another origin is rejected.
  if (!/^\/[A-Za-z0-9_\-./?=&%#~]*$/.test(next)) return fallback;
  if (next.startsWith('//') || next.startsWith('/\\')) return fallback;
  try {
    const base = 'https://yo-bot.invalid';
    const resolved = new URL(next, base);
    if (resolved.origin !== base) return fallback;
    // "/..//host" normalises to "//host", which a later new URL() would
    // treat as protocol-relative — so check the normalised path too.
    if (resolved.pathname.startsWith('//')) return fallback;
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return fallback;
  }
}

// Supabase link types we complete. Anything else is rejected rather than
// passed straight through to verifyOtp.
const OTP_TYPES = new Set(['signup', 'recovery', 'email_change', 'email', 'invite', 'magiclink']);

// A recovery link is the only legitimate way to reach /reset-password. The
// callback marks that with a short-lived cookie so updatePassword can tell a
// recovery session apart from an ordinary (or stolen) login session.
export const RECOVERY_COOKIE = 'yb-recovery';
const RECOVERY_TTL_S = 15 * 60;

/**
 * Completes any Supabase auth redirect — signup confirmation, password
 * recovery, email change — and establishes the session cookie.
 *
 * Handles both link shapes so it works whichever email template is in use:
 *   ?code=...                 default template, PKCE exchange
 *   ?token_hash=...&type=...  the "server-side auth" template, OTP verify
 */
export async function completeAuthRedirect(request) {
  const url = new URL(request.url);
  const origin = await siteOrigin();
  const next = safeNext(url.searchParams.get('next'));

  // Supabase reports expired/consumed links on the URL itself.
  const linkError =
    url.searchParams.get('error_description') || url.searchParams.get('error');
  if (linkError) return authError(origin, linkError);

  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return authError(origin, error.message);
    return done(origin, next, next === '/reset-password');
  }

  if (tokenHash && type) {
    if (!OTP_TYPES.has(type)) return authError(origin, 'Unknown link type.');
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return authError(origin, error.message);
    return done(origin, next, type === 'recovery' || next === '/reset-password');
  }

  return authError(origin, 'This link is missing its confirmation token.');
}

function done(origin, next, recovery) {
  const res = NextResponse.redirect(new URL(next, origin));
  if (recovery) {
    res.cookies.set(RECOVERY_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: origin.startsWith('https://'),
      path: '/',
      maxAge: RECOVERY_TTL_S,
    });
  }
  return res;
}

function authError(origin, reason) {
  const to = new URL('/auth-error', origin);
  to.searchParams.set('reason', reason);
  return NextResponse.redirect(to);
}
