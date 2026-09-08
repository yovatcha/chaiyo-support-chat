// Public chat endpoint — serves EVERY bot on the platform.
// The embed widget POSTs { bot: "<public_id>", messages: [...] } and this
// grounds the model in that bot's knowledge (loaded from Supabase).
//
// Env: GROQ_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { buildSystemPrompt } from '@/lib/prompt';
import { getBotByPublicId, isPublicId, supabaseConfigured, CHAT_COLUMNS } from '@/lib/bots';
import { createLimiter, clientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const GROQ_URL = process.env.GROQ_URL || 'https://api.groq.com/openai/v1/chat/completions';
// Groq retires models without notice (the Llama 3.x ids this shipped with are
// gone); check GET /openai/v1/models with your key if chats start failing.
const MODEL = process.env.CHAT_MODEL || 'openai/gpt-oss-120b';
// Groq TPM limits are per model, so a second model is a fresh quota bucket.
const FALLBACK_MODEL = process.env.CHAT_FALLBACK_MODEL || 'openai/gpt-oss-20b';
const MAX_RETRY_WAIT_MS = 3_000;

const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY = 8;
const MAX_BODY_BYTES = 16 * 1024;
const BOT_TTL_MS = 60_000;

// Per visitor: 10 messages a minute. Per bot: 120 a minute across all its
// visitors, so one leaked public_id cannot burn the whole platform's quota.
// Both are best-effort in-memory limits — see lib/rate-limit.js.
const ipLimited = createLimiter({ limit: 10, windowMs: 60_000 });
const botLimited = createLimiter({ limit: 120, windowMs: 60_000 });

const botCache = new Map(); // public_id -> { bot, prompt, ts }
const BOT_CACHE_MAX = 500;

function corsHeaders(origin) {
  const h = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    // Always vary on Origin so a shared cache never serves one origin's
    // response (with its ACAO header) to another.
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

async function loadBot(publicId) {
  const cached = botCache.get(publicId);
  if (cached && Date.now() - cached.ts < BOT_TTL_MS) return cached;

  const bot = await getBotByPublicId(publicId, CHAT_COLUMNS);
  if (!bot) return null;

  const prompt = buildSystemPrompt({
    persona: bot.persona,
    scope: bot.scope,
    fallbackContact: bot.fallback_contact,
    knowledge: bot.knowledge,
  });
  const entry = { bot, prompt, ts: Date.now() };
  if (botCache.size >= BOT_CACHE_MAX) botCache.delete(botCache.keys().next().value);
  botCache.set(publicId, entry);
  return entry;
}

function callGroq(model, messages) {
  const body = { model, messages, max_tokens: 600, temperature: 0.5 };
  // Reasoning models spend the token budget thinking; keep it short for chat.
  if (/gpt-oss|qwen3/.test(model)) body.reasoning_effort = 'low';
  return fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
}

// 404 model_not_found / 400 model_decommissioned: the primary model is gone,
// not busy — go straight to the fallback rather than failing every chat.
function modelGone(status, bodyText) {
  return (
    status === 404 ||
    (status === 400 && /model_decommissioned|model_not_found|does not exist/i.test(bodyText || ''))
  );
}

// Wait suggested by a 429: Retry-After header, else "try again in Xs" in the
// body Groq sends. Returns milliseconds, or null if neither is present.
function retryWaitMs(res, bodyText) {
  const header = Number(res.headers.get('retry-after'));
  if (Number.isFinite(header) && header > 0) return header * 1000;
  const m = /try again in (\d+(?:\.\d+)?)(m?s)/i.exec(bodyText || '');
  if (m) return m[2].toLowerCase() === 'ms' ? Number(m[1]) : Number(m[1]) * 1000;
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Per-bot origin allow-list. Only meaningful for browsers (which always send
// Origin on cross-site POSTs); a non-browser client can set any Origin, so
// this is a "keep the widget on the owner's site" control, not a secret.
function originAllowed(bot, origin) {
  const list = bot.allowed_origins || [];
  if (list.length === 0) return true; // not restricted (default)
  if (!origin) return false; // restricted bots require a browser Origin
  return list.includes(origin);
}

// Read at most MAX_BODY_BYTES of JSON; larger bodies are rejected outright.
async function readJson(request) {
  const len = Number(request.headers.get('content-length'));
  if (Number.isFinite(len) && len > MAX_BODY_BYTES) return { tooLarge: true };
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return { tooLarge: true };
  try {
    return { body: JSON.parse(text) };
  } catch {
    return { invalid: true };
  }
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

  // Validate everything about the request before touching the database.
  const parsed = await readJson(request);
  if (parsed.tooLarge) return json({ error: 'Request too large.' }, 413, origin);
  if (parsed.invalid || !parsed.body || typeof parsed.body !== 'object') {
    return json({ error: 'Invalid JSON body.' }, 400, origin);
  }
  const { messages, bot: botId } = parsed.body;

  if (!isPublicId(botId)) {
    return json({ error: 'Missing or invalid "bot" id.' }, 400, origin);
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages[] required' }, 400, origin);
  }
  if (messages.length > MAX_HISTORY * 2) {
    return json({ error: `Too many messages (max ${MAX_HISTORY * 2}).` }, 400, origin);
  }
  const history = [];
  for (const m of messages.slice(-MAX_HISTORY)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
      return json({ error: 'Each message needs role "user"|"assistant" and string content.' }, 400, origin);
    }
    const content = m.content.trim();
    if (!content) continue;
    if (content.length > MAX_MESSAGE_CHARS) {
      return json({ error: `Message too long (max ${MAX_MESSAGE_CHARS} characters).` }, 400, origin);
    }
    history.push({ role: m.role, content });
  }
  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return json({ error: 'last message must be from user' }, 400, origin);
  }

  const ip = clientIp(request);
  if (ipLimited(ip) || botLimited(botId)) {
    return json(
      { error: 'Too many messages — take a breath and try again in a minute.' },
      429,
      origin,
      { 'Retry-After': '30' }
    );
  }

  let entry;
  try {
    entry = await loadBot(botId);
  } catch (err) {
    console.error('bot load error', err);
    return json({ error: 'Could not load bot configuration.' }, 502, origin);
  }
  if (!entry) {
    return json({ error: 'Unknown bot.' }, 404, origin);
  }
  if (!originAllowed(entry.bot, origin)) {
    return json({ error: 'This bot is not enabled for this website.' }, 403, origin);
  }

  const chatMessages = [{ role: 'system', content: entry.prompt }, ...history];

  try {
    let model = MODEL;
    let groqRes = await callGroq(model, chatMessages);

    // 429 = per-model TPM quota exhausted. Retry the primary once if the
    // suggested wait is short, then fall back to a model with its own quota.
    if (groqRes.status === 429) {
      const bodyText = await groqRes.text().catch(() => '');
      console.error('groq error', groqRes.status, bodyText);
      const wait = retryWaitMs(groqRes, bodyText);
      if (wait !== null && wait <= MAX_RETRY_WAIT_MS) {
        await sleep(wait);
        groqRes = await callGroq(model, chatMessages);
      }
      if (groqRes.status === 429) {
        await groqRes.text().catch(() => ''); // drain before dropping
        model = FALLBACK_MODEL;
        groqRes = await callGroq(model, chatMessages);
      }
    } else if (!groqRes.ok) {
      const bodyText = await groqRes.text().catch(() => '');
      console.error('groq error', groqRes.status, bodyText);
      if (modelGone(groqRes.status, bodyText) && model !== FALLBACK_MODEL) {
        model = FALLBACK_MODEL;
        groqRes = await callGroq(model, chatMessages);
      } else {
        return json({ error: 'The model is unavailable right now — please try again shortly.' }, 502, origin);
      }
    }

    if (groqRes.status === 429) {
      console.error('groq error', groqRes.status, await groqRes.text().catch(() => ''));
      return json(
        { error: 'The assistant is busy right now — please try again in a few seconds.' },
        429,
        origin,
        { 'Retry-After': '10' }
      );
    }
    if (!groqRes.ok) {
      console.error('groq error', groqRes.status, await groqRes.text().catch(() => ''));
      return json({ error: 'The model is unavailable right now — please try again shortly.' }, 502, origin);
    }

    let data;
    try {
      data = await groqRes.json();
    } catch (err) {
      console.error('groq non-JSON response', err);
      return json({ error: 'The model returned an unreadable reply.' }, 502, origin);
    }
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return json({ error: 'Empty reply from model.' }, 502, origin);
    }
    return json({ reply }, 200, origin);
  } catch (err) {
    console.error('chat handler error', err);
    return json({ error: 'Something went wrong.' }, 500, origin);
  }
}
