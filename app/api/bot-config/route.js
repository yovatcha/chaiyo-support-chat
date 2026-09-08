// Public bot-config endpoint — serves the embed widget's *display* settings
// (name, header title/description, greeting, placeholder, colours) so the
// chat bubble can theme + label itself on load.
//
// The widget GETs /api/bot-config?bot=<public_id> cross-origin, so this mirrors
// the CORS handling of /api/chat. Only display columns are ever loaded —
// persona/knowledge/allowed_origins never reach this handler.
//
// Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { getBotByPublicId, isPublicId, supabaseConfigured, DISPLAY_COLUMNS } from '@/lib/bots';
import { createLimiter, clientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const DEFAULT_ACCENT = '#5e85a4';
const DEFAULT_BG = '#0a0c14';
const DEFAULT_FONT = '#eef1f8';
const HEX = /^#[0-9a-fA-F]{6}$/;

const hex = (v, fallback) => (HEX.test(v || '') ? v : fallback);

// One config fetch per page load is normal; 60/min per IP is generous.
const ipLimited = createLimiter({ limit: 60, windowMs: 60_000 });

const cache = new Map(); // public_id -> { body, ts }
const CACHE_TTL_MS = 60_000;
const CACHE_MAX = 500;

function corsHeaders(origin) {
  const h = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (origin) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

function json(body, status, origin, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin), ...extra },
  });
}

export async function OPTIONS(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) });
}

export async function GET(request) {
  const origin = request.headers.get('origin');

  if (!supabaseConfigured()) {
    return json({ error: 'Not configured.' }, 503, origin);
  }

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get('bot') || '';
  if (!isPublicId(botId)) {
    return json({ error: 'Missing or invalid "bot" id.' }, 400, origin);
  }

  if (ipLimited(clientIp(request))) {
    return json({ error: 'Too many requests.' }, 429, origin, { 'Retry-After': '30' });
  }

  const cached = cache.get(botId);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return json(cached.body, cached.body.error ? 404 : 200, origin);
  }

  let bot;
  try {
    bot = await getBotByPublicId(botId, DISPLAY_COLUMNS);
  } catch (err) {
    console.error('bot-config lookup error', err);
    return json({ error: 'Could not load bot configuration.' }, 502, origin);
  }

  const body = bot
    ? {
        bot: botId,
        bot_name: (bot.bot_name || '').trim(),
        title: (bot.title || '').trim(),
        description: (bot.description || '').trim(),
        greeting: (bot.greeting || '').trim(),
        placeholder: (bot.placeholder || '').trim(),
        accent_color: hex(bot.accent_color, DEFAULT_ACCENT),
        bg_color: hex(bot.bg_color, DEFAULT_BG),
        font_color: hex(bot.font_color, DEFAULT_FONT),
      }
    : { error: 'Unknown bot.' };

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(botId, { body, ts: Date.now() });

  return json(body, bot ? 200 : 404, origin, {
    'Cache-Control': 'public, max-age=60, s-maxage=60',
  });
}
