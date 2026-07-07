import { updateSession } from './lib/supabase/middleware';

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  // Supabase's client uses Node.js APIs unsupported in the Edge Runtime, so run
  // this middleware on Node.js (paired with experimental.nodeMiddleware in
  // next.config.js). Otherwise requests fail with MIDDLEWARE_INVOCATION_FAILED.
  runtime: 'nodejs',
  // Run on all app routes EXCEPT static assets, the embeddable widget, and the
  // public chat API (which must stay open to cross-origin embeds).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|yo-bot.js|api).*)'],
};
