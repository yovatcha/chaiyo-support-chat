# Yo-bot — AI support chat for any website 🤖

A small multi-tenant platform: sign up, describe your bot (persona, scope,
knowledge base, colours) in a dashboard, and drop one line on your site:

```html
<script src="https://YOUR-CHAT-DOMAIN/yo-bot.js" data-bot="bot_xxxxxxxxxxxx" defer></script>
```

The widget renders a chat bubble, fetches the bot's display settings, and
sends messages to `/api/chat`, which grounds an LLM served by Groq in that
bot's knowledge text.

## Stack

| Layer | Tech |
|---|---|
| App | Next.js 15 App Router (JavaScript), React 19 |
| Auth + DB | Supabase (email/password auth, Postgres with RLS) via `@supabase/ssr` |
| Model | Groq, OpenAI-compatible chat completions (`openai/gpt-oss-120b`, fallback `openai/gpt-oss-20b`; override with `CHAT_MODEL`) |
| Hosting | Vercel (framework preset **Next.js**) |

## Layout

```
app/
  (auth)/               login, signup, forgot/reset password, check-email, auth-error
  (auth)/actions.js     server actions for the auth forms
  auth/callback|confirm route handlers that turn Supabase email links into a session (lib/auth.js)
  dashboard/            bot list, new, edit — server components, guarded in layout.js
  dashboard/actions.js  createBot / updateBot / deleteBot / signOut
  api/chat/route.js     public chat endpoint (validation, rate limit, Groq call, model fallback)
  api/bot-config/route.js
                        public display settings for the widget (name, colours, greeting…)
lib/
  bots.js               reads bots with the service-role key (server only)
  prompt.js             builds the system prompt from persona/scope/knowledge
  rate-limit.js         best-effort in-memory limiter shared by both endpoints
  bot-limits.js         field size caps shared by the form and the action
  supabase/{server,client}.js
components/             BotForm, Appearance, ColorPicker, CopyEmbed, SubmitButton,
                        DeleteBotButton, SessionKeeper
public/yo-bot.js        the embeddable widget (plain IIFE, no dependencies)
supabase/setup.sql      the ONE idempotent database setup file
mamba/                  separate showcase: fine-tuning a Mamba model + HF Space server
```

## Setup

1. **Supabase project** → SQL Editor → paste `supabase/setup.sql` → Run.
   It is idempotent: re-run it after pulling changes that add columns.
2. **Supabase → Authentication → URL Configuration**: set *Site URL* to your
   production origin and add `https://YOUR-DOMAIN/auth/callback` and
   `http://localhost:3000/auth/callback` to *Redirect URLs*. Without this,
   Supabase replaces the app's redirect with the Site URL.
3. **Groq key**: https://console.groq.com/keys
4. `cp .env.example .env.local` and fill in:

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Groq API key (required) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key (browser + user-scoped server calls) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **secret** key — used only by `lib/bots.js` on the server to read bots for the public endpoints |
| `NEXT_PUBLIC_SITE_URL` | Absolute origin used in auth emails. Set in production; otherwise the request Host header is used |
| `CHAT_MODEL`, `CHAT_FALLBACK_MODEL`, `GROQ_URL` | Optional model / endpoint overrides |

5. `npm install && npm run dev` → http://localhost:3000

## Deploy (Vercel)

- Import the repo; framework preset must be **Next.js**.
- Add the environment variables above (production + preview).
- Set `NEXT_PUBLIC_SITE_URL` to the production origin.
- Recommended: add a **Vercel WAF rate-limit rule** for `/api/chat` and
  `/api/bot-config`. The in-code limiter is per function instance and only
  stops casual abuse.

## How a chat request works

widget → `POST /api/chat { bot, messages }` → validate body, bot id, sizes →
rate limit (per IP and per bot) → load bot (60 s in-memory cache) → check the
bot's allowed origins → system prompt = rules + `<persona>` + `<knowledge>` →
Groq → on 429 retry once, then fall back to the second model → `{ reply }`.

Limits: 500 characters per message, last 8 turns, 16 KB body, 10 messages a
minute per IP, 120 a minute per bot.

## Embed options

```html
<script
  src="https://YOUR-CHAT-DOMAIN/yo-bot.js"
  data-bot="bot_xxxxxxxxxxxx"      <!-- required: from the dashboard -->
  data-bot-name="Acme Support"     <!-- header name (dashboard title wins if set) -->
  data-lang="th"                   <!-- force UI language th/en (default: browser) -->
  data-accent="#5e85a4"            <!-- inline theme overrides: data-accent / data-bg / data-font -->
  data-title="…" data-description="…" data-greeting="…" data-placeholder="…"
  data-endpoint="https://…/api/chat"            <!-- optional override -->
  data-mamba-endpoint="https://….hf.space/chat" <!-- enables the Mamba toggle -->
  defer
></script>
```

Restrict which sites may use a bot with **Allowed website origins** in the
dashboard (e.g. `https://acme.com, https://www.acme.com`). This is enforced
against the browser's `Origin` header, so it keeps the widget on your sites;
it is not a secret.

## Security notes

- The dashboard talks to Supabase as the logged-in user; RLS restricts every
  row to its owner, and the server actions additionally filter by owner.
- The public endpoints use the service-role key server-side only and load only
  the columns they need; `persona` and `knowledge` never leave `/api/chat`.
- Bot fields are wrapped in `<persona>` / `<knowledge>` boundaries in the
  prompt and the rules are restated after the knowledge, which limits (but
  cannot fully prevent) prompt injection from pasted content.
- Auth email links may only redirect to a path on this site; the password
  reset form only works for a session that arrived through a recovery link.

## Scripts

```
npm run dev     # local dev
npm run build   # production build
npm run lint    # eslint (next/core-web-vitals)
```

## Mamba showcase

`mamba/` is an independent side project (dataset, Colab notebook, and a
FastAPI Docker Space). See `mamba/README.md`. Point the widget at it with
`data-mamba-endpoint`.
