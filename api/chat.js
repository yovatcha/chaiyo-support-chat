// Vercel Serverless Function — multi-site AI support chat.
//
// One endpoint serves EVERY registered website: the widget sends
// { site: "<id>", messages: [...] } and this function grounds the model in
// that site's knowledge (see sites/<id>/). No site param = default site.
//
// Strategy: context stuffing / grounded generation. Each site's knowledge
// (a few KB) is placed whole in the system prompt — at this size a vector
// DB adds nothing. Inference runs on Groq's free tier (OpenAI-compatible).
//
// Required environment variable (Vercel → Settings → Environment Variables):
//   GROQ_API_KEY — free key from https://console.groq.com/keys
//
// Optional:
//   CHAT_MODEL      — defaults to "llama-3.3-70b-versatile"
//   ALLOWED_ORIGINS — comma-separated origins allowed to embed the widget
//                     cross-site (e.g. "https://blog.example.com").
//                     Defaults to "*" so the one-line embed works anywhere;
//                     tighten it if you want the API portfolio-only.

import { SITES, DEFAULT_SITE } from '../sites/index.js';
import { buildSystemPrompt } from './_prompt.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.CHAT_MODEL || 'llama-3.3-70b-versatile';

// System prompts are deterministic per site — build once per warm instance.
const promptCache = new Map();
function systemPromptFor(siteId) {
  if (!promptCache.has(siteId)) {
    promptCache.set(siteId, buildSystemPrompt(SITES[siteId]));
  }
  return promptCache.get(siteId);
}

// Guardrails so a single visitor can't burn the free tier.
const MAX_MESSAGE_CHARS = 500; // per user message
const MAX_HISTORY = 8; // turns kept from client history
const RATE_LIMIT = 10; // requests…
const RATE_WINDOW_MS = 60_000; // …per minute per IP (warm-instance memory)

const hits = new Map(); // ip -> [timestamps]

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return; // same-origin request — no CORS headers needed
  if (ALLOWED_ORIGINS.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (ALLOWED_ORIGINS.includes(origin)) {
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

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many messages — take a breath and try again in a minute.' });
  }

  // Validate body: { site?: string, messages: [{ role, content }] }
  const { messages, site: siteRaw } = req.body || {};
  const siteId = typeof siteRaw === 'string' && siteRaw ? siteRaw : DEFAULT_SITE;
  if (!SITES[siteId]) {
    return res.status(400).json({ error: `Unknown site "${siteId.slice(0, 40)}"` });
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
        messages: [{ role: 'system', content: systemPromptFor(siteId) }, ...history],
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
    return res.status(200).json({ reply, model: 'groq', site: siteId });
  } catch (err) {
    console.error('chat handler error', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
