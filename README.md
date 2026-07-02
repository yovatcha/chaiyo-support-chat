# Yo-bot — Multi-site AI Support Chat 🤖

One chat service, many websites. Each site registers its own knowledge base
(a "tenant" in `sites/`), and any website plugs in with one line:

```html
<script src="https://YOUR-CHAT-DOMAIN/yo-bot.js" data-site="<site-id>" defer></script>
```

The first tenant is Chaiyo's portfolio (`sites/portfolio/`), which also has a
bonus "My Mamba" mode — a model Chaiyo fine-tuned himself.

Two answer engines, both **$0**:

| Mode | Model | Runs on | Quality |
|---|---|---|---|
| Smart (default) | Llama 3.3 70B via Groq free tier | `/api/chat` Vercel function | Good, grounded in `sites/<id>/knowledge.js` |
| My Mamba (portfolio showcase) | Mamba fine-tuned by Chaiyo | Hugging Face Space (free CPU) | Rough on purpose — the flex is the training |

## Architecture

```
public/yo-bot.js         embeddable widget (sends { site, messages })
api/chat.js              ONE endpoint for all sites: validates, rate-limits,
                         picks the site's prompt, calls Groq
api/_prompt.js           central prompt builder — generic rules every site
                         inherits (grounding, refusals, language mirroring)
sites/
  index.js               site registry (id → config)
  portfolio/             tenant #1: Chaiyo's portfolio
    config.js            persona, scope, fallback contact
    knowledge.js         everything this site's bot knows
  _template/             copy me to add a new site
mamba/                   portfolio-only showcase: dataset + Colab notebook
                         + HF Space server
public/index.html        live demo page (deployed at the root URL)
```

Request flow: widget → `POST /api/chat { site: "portfolio", messages }` →
look up `sites/portfolio` → system prompt = generic rules + persona +
knowledge (context stuffing / grounded generation) → Groq → reply.

## Add a new website (3 steps, ~10 minutes)

1. **Copy the template:** `cp -r sites/_template sites/my-site`, then fill in
   `config.js` (id, persona, scope, fallback contact) and `knowledge.js`
   (everything the bot should know, plain text).
2. **Register it** in `sites/index.js`:
   ```js
   import mySite from './my-site/config.js';
   export const SITES = { [portfolio.id]: portfolio, [mySite.id]: mySite };
   ```
3. **Embed on that website:**
   ```html
   <script src="https://YOUR-CHAT-DOMAIN/yo-bot.js"
           data-site="my-site" data-bot-name="MyBot" defer></script>
   ```
   Deploy the chat service and it's live. No other backend changes needed.

## Deploy (~5 minutes)

1. Push this folder to a GitHub repo.
2. Import it on [vercel.com](https://vercel.com) → Framework preset: **Other**
   (no build step; `public/` is served statically, `api/` becomes functions).
3. Get a free key at https://console.groq.com/keys and add it in
   Vercel → Settings → Environment Variables: `GROQ_API_KEY`.
4. Deploy. Open the root URL — the demo page has the widget live.

Local dev: `cp .env.example .env`, fill in the key, then `npx vercel dev`.

## Embed options

```html
<script
  src="https://YOUR-CHAT-DOMAIN/yo-bot.js"
  data-site="portfolio"                                  <!-- which knowledge base -->
  data-bot-name="Yo-bot"                                 <!-- display name -->
  data-lang="th"                                         <!-- force UI language (default: browser) -->
  data-endpoint="https://YOUR-CHAT-DOMAIN/api/chat"      <!-- optional override -->
  data-mamba-endpoint="https://your-space.hf.space/chat" <!-- enables Mamba toggle -->
  defer
></script>
```

The widget auto-targets `/api/chat` on the origin that served the script, so
a plain one-line embed needs no config. Cross-site embeds are allowed by
default; set `ALLOWED_ORIGINS` (comma-separated) on Vercel to restrict.

## Mamba showcase (portfolio tenant only)

See `mamba/README.md`: fine-tune a Mamba on `mamba/dataset.jsonl` in a free
Colab T4, push to Hugging Face, deploy `mamba/hf-space/` as a free Docker
Space, then add `data-mamba-endpoint` to the embed line.

## Keeping it $0 and safe

- Rate limit: 10 msg/min/IP, message length + history capped, unknown site
  ids rejected.
- The system prompt confines answers to each site's knowledge and refuses
  off-topic use, so the endpoint can't be farmed as a free general LLM.
- Groq is OpenAI-compatible — swapping to Gemini/OpenRouter is a two-line
  change in `api/chat.js`.

## Updating what a bot knows

Edit `sites/<id>/knowledge.js` and redeploy — that file is the single source
of truth for that site's Smart mode. For the portfolio's Mamba mode, add
matching Q&A pairs to `mamba/dataset.jsonl` and re-run the notebook.

## Roadmap ideas

- Retrieval stage (real RAG) when a site's knowledge outgrows the prompt
- `/api/site-config` so greeting/branding also come from the server
- Per-site theming via config instead of CSS variables only
- Usage analytics per site
