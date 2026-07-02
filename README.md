# Yo-bot — AI Support Chat 🤖

An embeddable AI chatbot that answers questions about Chaiyo (Vatcharamai
Rodring). Runs as its own Vercel project; any website adds it with one line:

```html
<script src="https://YOUR-CHAT-DOMAIN/yo-bot.js" defer></script>
```

Two modes, both **$0**:

| Mode | Model | Runs on | Quality |
|---|---|---|---|
| Smart (default) | Llama 3.3 70B via Groq free tier | `/api/chat` Vercel function | Good, grounded in `api/_knowledge.js` |
| My Mamba (showcase) | Mamba-130M fine-tuned by me | Hugging Face Space (free CPU) | Rough on purpose — the flex is that I trained it |

## Structure

```
api/chat.js            serverless chat endpoint (rate-limited, validated, CORS)
api/_knowledge.js      everything the bot knows — edit freely
public/yo-bot.js       the embeddable widget
public/index.html      live demo page (deployed at the root URL)
mamba/                 dataset + Colab fine-tune notebook + HF Space server
```

## Deploy (~5 minutes)

1. Push this folder to a new GitHub repo.
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
  data-endpoint="https://YOUR-CHAT-DOMAIN/api/chat"     <!-- optional override -->
  data-mamba-endpoint="https://your-space.hf.space/chat" <!-- enables Mamba toggle -->
  defer
></script>
```

The widget auto-targets `/api/chat` on the origin that served the script, so
plain one-line embeds need no config. Cross-site embeds are allowed by
default; set `ALLOWED_ORIGINS` (comma-separated) on Vercel to restrict.

## Mamba showcase

See `mamba/README.md`: fine-tune `mamba-130m` on `mamba/dataset.jsonl` in a
free Colab T4 (~10 min), push to Hugging Face, deploy `mamba/hf-space/` as a
free Docker Space, then add `data-mamba-endpoint` to your embed line.

## Keeping it $0 and safe

- Rate limit: 10 msg/min/IP, message length + history capped.
- The system prompt confines answers to the knowledge base and refuses
  off-topic use, so the endpoint can't be farmed as a free general LLM.
- Groq is OpenAI-compatible — swapping to Gemini/OpenRouter is a two-line
  change in `api/chat.js`.

## Updating what the bot knows

Edit `api/_knowledge.js` and redeploy. That file is the single source of
truth for Smart mode. For Mamba mode, add matching Q&A pairs to
`mamba/dataset.jsonl` and re-run the notebook.
