// Public chat endpoint — serves EVERY bot on the platform.
// The embed widget POSTs { bot: "<public_id>", messages: [...] } and this
// grounds the model in that bot's knowledge (loaded from Supabase).
//
// Env: GROQ_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { buildSystemPrompt } from '@/lib/prompt';
import { getBotByPublicId, supabaseConfigured } from '@/lib/bots';

export const dynamic = 'force-dynamic';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.CHAT_MODEL || 'llama-3.3-70b-versatile';
const DEFAULT_BOT = 'portfolio';

const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY = 8;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const BOT_TTL_MS = 60_000;

const botCache = new Map(); // public_id -> { bot, prompt, ts }
const hits = new Map(); // ip -> [timestamps]

function corsHeaders(origin) {
  const h = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_LIMIT;
}

async function loadBot(publicId) {
  const cached = botCache.get(publicId);
  if (cached && Date.now() - cached.ts < BOT_TTL_MS) return cached;

  const bot = await getBotByPublicId(publicId);
  if (!bot) return null;

  const prompt = buildSystemPrompt({
    persona: bot.persona,
    scope: bot.scope,
    fallbackContact: bot.fallback_contact,
    knowledge: bot.knowledge,
  });
  const entry = { bot, prompt, ts: Date.now() };
  botCache.set(publicId, entry);
  return entry;
}

function originAllowed(bot, origin) {
  const list = bot.allowed_origins || [];
  if (list.length === 0) return true; // not restricted (MVP default)
  if (!origin) return true; // same-origin / server-to-server
  return list.includes(origin);
}

export async function OPTIONS(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) });
}

export async function POST(request) {
  const origin = request.headers.get('origin');

  if (!process.env.GROQ_API_KEY) {
    return json({ error: 'Chat backend not configured (missing GROQ_API_KEY).' }, 503, origin);
  }
  if (!supabaseConfigured()) {
    return json({ error: 'Chat backend not configured (missing Supabase env).' }, 503, origin);
  }

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return json({ error: 'Too many messages — take a breath and try again in a minute.' }, 429, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const { messages, bot: botRaw, site: siteRaw } = body || {};
  const botId =
    (typeof botRaw === 'string' && botRaw) ||
    (typeof siteRaw === 'string' && siteRaw) ||
    DEFAULT_BOT;

  let entry;
  try {
    entry = await loadBot(botId);
  } catch (err) {
    console.error('bot load error', err);
    return json({ error: 'Could not load bot configuration.' }, 502, origin);
  }
  if (!entry) {
    return json({ error: `Unknown bot "${String(botId).slice(0, 40)}"` }, 400, origin);
  }
  if (!originAllowed(entry.bot, origin)) {
    return json({ error: 'This bot is not enabled for this website.' }, 403, origin);
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages[] required' }, 400, origin);
  }
  const history = messages
    .slice(-MAX_HISTORY)
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return json({ error: 'last message must be from user' }, 400, origin);
  }

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: entry.prompt }, ...history],
        max_tokens: 400,
        temperature: 0.5,
      }),
    });

    if (!groqRes.ok) {
      console.error('groq error', groqRes.status, await groqRes.text().catch(() => ''));
      return json({ error: 'The model is unavailable right now — please try again shortly.' }, 502, origin);
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return json({ error: 'Empty reply from model.' }, 502, origin);
    }
    return json({ reply, model: 'groq', bot: botId }, 200, origin);
  } catch (err) {
    console.error('chat handler error', err);
    return json({ error: 'Something went wrong.' }, 500, origin);
  }
}
