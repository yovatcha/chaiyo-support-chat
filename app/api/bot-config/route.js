// Public bot-config endpoint — serves the embed widget's *display* settings
// (name + accent color) so the chat bubble can theme itself on load.
//
// The widget GETs /api/bot-config?bot=<public_id> cross-origin, so this mirrors
// the CORS handling of /api/chat. It returns only non-sensitive display fields —
// never persona/knowledge/allowed_origins.
//
// Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { getBotByPublicId, supabaseConfigured } from '@/lib/bots';

export const dynamic = 'force-dynamic';

const DEFAULT_BOT = 'portfolio';
const DEFAULT_ACCENT = '#5e85a4';
const HEX = /^#[0-9a-fA-F]{6}$/;

function corsHeaders(origin) {
  const h = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
  if (origin) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Vary'] = 'Origin';
  }
  return h;
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
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
  const botId = (searchParams.get('bot') || searchParams.get('site') || DEFAULT_BOT).slice(0, 60);

  let bot;
  try {
    bot = await getBotByPublicId(botId);
  } catch (err) {
    console.error('bot-config lookup error', err);
    return json({ error: 'Could not load bot configuration.' }, 502, origin);
  }
  if (!bot) {
    return json({ error: `Unknown bot "${String(botId).slice(0, 40)}"` }, 404, origin);
  }

  return json(
    {
      bot: botId,
      bot_name: bot.bot_name,
      accent_color: HEX.test(bot.accent_color || '') ? bot.accent_color : DEFAULT_ACCENT,
    },
    200,
    origin
  );
}
