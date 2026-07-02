# Yo-bot Mamba — the "trained it myself" showcase

Phase 2 of the AI support chat: a Mamba-130M state-space model fine-tuned by
me (Chaiyo) on Q&A about myself, served for free, and toggleable from the
portfolio chat widget. Total cost: **$0**.

## Why fine-tune instead of train from scratch?

A from-scratch model that speaks coherent English needs billions of training
tokens and thousands of GPU-hours. Fine-tuning `state-spaces/mamba-130m-hf`
keeps the "I trained a Mamba myself" story real while fitting in a free Colab
session (~10 min on a T4). The last notebook cell shows how to try
from-scratch later if you want the learning exercise.

## Pipeline

1. **Data** — `dataset.jsonl`, ~45 Q&A pairs (EN + TH) generated from the
   portfolio content. Format: `{"text": "Q: …\nA: …"}`. Add more paraphrases
   any time; tiny models need the same fact in many phrasings.
2. **Train** — open `finetune_mamba_colab.ipynb` in Google Colab
   (free T4 GPU), upload `dataset.jsonl`, run all cells. The notebook
   fine-tunes, sanity-tests generation, and pushes the model to your
   Hugging Face account (`yovatcha/yo-bot-mamba-130m`).
3. **Serve** — create a new Hugging Face **Space** (SDK: Docker, free CPU),
   upload the three files in `hf-space/`. It exposes `POST /chat` with the
   same schema as `/api/chat`. Set the Space env var
   `ALLOWED_ORIGINS=https://your-portfolio-domain.com`.
4. **Plug in** — add the attribute to the embed line (in `index.html` or on
   any site): `data-mamba-endpoint="https://<your-space>.hf.space/chat"`.
   The "My Mamba" toggle appears automatically.

## Expectations

- CPU inference of 130M params takes a few seconds per reply — fine for a demo.
- Answers will be memorized and occasionally weird. That's the charm; the
  widget labels the mode experimental and the Smart (Groq) mode stays default.
- Free HF Spaces sleep after inactivity; first request after a nap is slow.
