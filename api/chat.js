// Vercel Serverless Function — multi-tenant AI support chat (platform MVP).
//
// One endpoint serves EVERY bot on the platform. The embed widget sends
// { bot: "<public_id>", messages: [...] } and this function grounds the model
// in that bot's knowledge, loaded from the database (Supabase table: bots).
//
// This replaces the old git-committed sites/ registry: bot config now lives in
// the DB, so users create and edit their own bots from a dashboard instead of
// a developer editing files and redeploying.
//
// Strategy: manual mode / context stuffing. The bot's `knowledge` text is
// placed whole in the system prompt (small knowledge bases don't need a vector
// DB). Inference runs on Groq (OpenAI-compatible).
//
// Required environment variables (Vercel → Settings → Environment Variables):
//   GROQ_API_KEY               — free key from https://console.groq.com/keys
//   SUPABASE_URL               — https://YOUR-PROJECT.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  — server-only; never expose to the browser
//
// Optional:
//   CHAT_MODEL — defaults to "llama-3.3-70b-versatile"

import { buildSystemPrompt } from './_prompt.js';
import { getBotByPublicId, supabaseConfigured } from './_supabase.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.CHAT_MODEL || 'llama-3.3-70b-versatile';

const DEFAULT_BOT = 'portfolio';

// Guardrails so a single visitor can't burn the free tier.
const MAX_MESSAGE_CHARS = 500; // per user message
const MAX_HISTORY = 8; // turns kept from client history
const RATE_LIMIT = 10; // requests…
const RATE_WINDOW_MS = 60_000; // …per minute per IP (warm-instance memory)

// Bot config comes from the DB; cache it per warm instance with a short TTL so
// dashboard edits show up within a minute without a DB hit on every message.
const BOT_TTL_MS = 60_000;
const botCache = new Map(); // public_id -> { bot, prompt, ts }

const hits = new Map(); // ip -> [timestamps]

function setCors(req, res) {
  // Embeds live on arbitrary customer domains, so reflect the request origin at
  // the CORS layer. Per-bot origin locking is enforced in the handler once we
  // know which bot is addressed (bots.allowed_origins).
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear(); // crude memory cap
  return list.length > RATE_LIMIT;
}

// Load a bot's config + prebuilt system prompt, cached per warm instance.
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

// Per-bot cross-origin control. Empty allow-list = allow any site (MVP default).
function originAllowed(bot, origin) {
  const list = bot.allowed_origins || [];
  if (list.length === 0) return true; // not restricted
  if (!origin) return true; // same-origin / server-to-server
  return list.includes(origin);
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      error: 'Chat backend not configured yet (missing GROQ_API_KEY).',
    });
  }
  if (!supabaseConfigured()) {
    return res.status(503).json({
      error: 'Chat backend not configured yet (missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).',
    });
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many messages — take a breath and try again in a minute.' });
  }

  // Body: { bot?: string, messages: [{ role, content }] }
  // `site` is accepted as a back-compat alias for `bot`.
  const { messages, bot: botRaw, site: siteRaw } = req.body || {};
  const botId =
    (typeof botRaw === 'string' && botRaw) ||
    (typeof siteRaw === 'string' && siteRaw) ||
    DEFAULT_BOT;

  let entry;
  try {
    entry = await loadBot(botId);
  } catch (err) {
    console.error('bot load error', err);
    return res.status(502).json({ error: 'Could not load bot configuration.' });
  }
  if (!entry) {
    return res.status(400).json({ error: `Unknown bot "${String(botId).slice(0, 40)}"` });
  }

  if (!originAllowed(entry.bot, req.headers.origin)) {
    return res.status(403).json({ error: 'This bot is not enabled for this website.' });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages[] required' });
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
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_MESSAGE_CHARS),
    }));
  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'last message must be from user' });
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
      const detail = await groqRes.text().catch(() => '');
      console.error('groq error', groqRes.status, detail);
      return res
        .status(502)
        .json({ error: 'The model is unavailable right now — please try again shortly.' });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ error: 'Empty reply from model.' });
    }
    return res.status(200).json({ reply, model: 'groq', bot: botId });
  } catch (err) {
    console.error('chat handler error', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
