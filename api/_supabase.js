// Minimal server-side Supabase access via PostgREST — zero npm dependencies,
// matching this project's fetch-based style.
//
// Uses the SERVICE ROLE key, which bypasses row-level security. It must stay
// server-side only (a Vercel env var) — never ship it to the browser/widget.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function supabaseConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

// Fetch one active bot by its public embed id (data-bot="..."). Returns the
// row object, or null if no active bot has that id.
export async function getBotByPublicId(publicId) {
  const url =
    `${SUPABASE_URL}/rest/v1/bots` +
    `?public_id=eq.${encodeURIComponent(publicId)}` +
    `&is_active=eq.true&select=*&limit=1`;

  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`supabase ${res.status}: ${await res.text().catch(() => '')}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}
