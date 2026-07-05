import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  // Run on all app routes EXCEPT static assets, the embeddable widget, and the
  // public chat API (which must stay open to cross-origin embeds).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|yo-bot.js|api).*)'],
};
