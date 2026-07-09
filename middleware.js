import { updateSession } from './lib/supabase/middleware';

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  // Runs on the default Edge runtime — the standard, Vercel-supported runtime
  // for Supabase SSR middleware. An earlier version forced `runtime: 'nodejs'`,
  // which Vercel built as Node.js middleware and then failed to invoke in
  // production (500 MIDDLEWARE_INVOCATION_FAILED). @supabase/ssr is
  // Edge-compatible: the build warns that supabase-js reads `process.version`,
  // but on Edge that is simply `undefined` and it falls back to global fetch.
  //
  // Run on all app routes EXCEPT static assets, the embeddable widget, and the
  // public chat API (which must stay open to cross-origin embeds).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|yo-bot.js|api).*)'],
};
