---
title: Yo-bot Mamba
emoji: 🐍
colorFrom: purple
colorTo: green
sdk: docker
app_port: 7860
---

# Yo-bot Mamba API

Serves the Mamba-130M model Chaiyo fine-tuned on facts about himself.
`POST /chat` with `{"messages":[{"role":"user","content":"Who is Chaiyo?"}]}`
returns `{"reply": "..."}` — same schema as the portfolio's `/api/chat`.

Deployed as a free-CPU Hugging Face Docker Space. See `../README.md` for the
full pipeline (train → push → deploy → plug into the widget).
