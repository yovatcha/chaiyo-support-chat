// Server-side bot lookup for the chat endpoint, via Supabase PostgREST.
//
// Uses the SERVICE ROLE key, which bypasses row-level security so the public
// chat endpoint can read any bot's config to answer visitors. Must stay
// server-side only (never shipped to the browser).

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function supabaseConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

// Fetch one active bot by its public embed id (data-bot="..."). null if none.
export async function getBotByPublicId(publicId) {
  const url =
    `${SUPABASE_URL}/rest/v1/bots` +
    `?public_id=eq.${encodeURIComponent(publicId)}` +
    `&is_active=eq.true&select=*&limit=1`;

  const res = await fetch(url, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`supabase ${res.status}: ${await res.text().catch(() => '')}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}
