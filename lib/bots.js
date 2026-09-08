// Server-side bot lookup for the public endpoints, via Supabase PostgREST.
//
// Uses the SERVICE ROLE key, which bypasses row-level security so the public
// chat endpoint can read any bot's config to answer visitors. Must stay
// server-side only (never shipped to the browser).

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public embed ids are either the DB-generated "bot_" + 12 hex chars or the
// seeded demo id. Anything else never reaches the database.
export const PUBLIC_ID_RE = /^(bot_[0-9a-f]{12}|portfolio)$/;

export function isPublicId(v) {
  return typeof v === 'string' && PUBLIC_ID_RE.test(v);
}

export function supabaseConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

// Columns each endpoint actually needs — persona/knowledge never leave the
// chat handler, and the display endpoint never even loads them.
export const CHAT_COLUMNS = 'public_id,persona,scope,fallback_contact,knowledge,allowed_origins';
export const DISPLAY_COLUMNS =
  'public_id,bot_name,title,description,greeting,placeholder,accent_color,bg_color,font_color';

// Fetch one active bot by its public embed id (data-bot="..."). null if none.
export async function getBotByPublicId(publicId, columns = CHAT_COLUMNS) {
  if (!isPublicId(publicId)) return null;

  const url =
    `${SUPABASE_URL}/rest/v1/bots` +
    `?public_id=eq.${encodeURIComponent(publicId)}` +
    `&is_active=eq.true&select=${encodeURIComponent(columns)}&limit=1`;

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
