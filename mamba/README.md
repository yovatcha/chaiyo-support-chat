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

1. **Data** — `dataset.jsonl`: ~60 hand-written Q&A pairs (EN + TH) with the
   Yo-bot persona baked into the answers. Format: `{"text": "Q: …\nA: …"}`.
   This file is YOUR voice — edit it freely; it's the single biggest quality lever.
2. **Augment** — `export GROQ_API_KEY=… && python3 augment.py` multiplies the
   pairs into ~300–500 paraphrased variants (`dataset_augmented.jsonl`) using
   the same free Groq tier. Facts stay yours; only wording varies. No pip
   installs needed (stdlib only).
3. **Train** — open `finetune_mamba_colab.ipynb` in Google Colab (free T4
   GPU), upload `dataset_augmented.jsonl`, run all cells. Default base is now
   `mamba-370m` (noticeably more fluent than 130m; still free to train). The
   notebook trains, sanity-tests with humanized sampling, and pushes to your
   Hugging Face account.
4. **Serve** — create a Hugging Face **Space** (SDK: Docker, free CPU), upload
   the files in `hf-space/`. Set env `MODEL_ID=your-username/yo-bot-mamba`
   and `ALLOWED_ORIGINS=https://your-portfolio-domain.com`. Personality knobs
   are env vars too: `TEMPERATURE` (default 0.7), `TOP_P` (0.9),
   `REPETITION_PENALTY` (1.3) — tune without redeploying.
5. **Plug in** — add the attribute to the embed line (in `index.html` or on
   any site): `data-mamba-endpoint="https://<your-space>.hf.space/chat"`.
   The "My Mamba" toggle appears automatically.

## Making it feel more human (your levers, in order of impact)

1. Dataset personality — the model clones whatever voice the answers use.
   Add small talk, humor, Thai-English mixing the way you actually speak.
2. More phrasings per fact — re-run `augment.py` after every dataset edit.
3. Sampling — temperature 0.7 feels alive; 0.5 is safer; greedy is robotic.
4. Model size — 370m > 130m fluency; 790m is better still but slow on free CPU.

## Expectations

- CPU inference takes a few seconds per reply (370m ~2-3x slower than 130m) —
  fine for a demo.
- Answers will stay close to the dataset and occasionally get weird. That's
  the charm; the widget labels the mode experimental and Smart stays default.
- Free HF Spaces sleep after inactivity; first request after a nap is slow.
