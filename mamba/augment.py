#!/usr/bin/env python3
"""Dataset augmentation for Yo-bot Mamba — multiplies Q&A pairs using the
Groq free tier (same API key as the chat service). Tiny models need the same
fact phrased many ways; this generates those phrasings automatically while
keeping YOUR answers as the source of truth.

Usage:
    export GROQ_API_KEY=gsk_...          # same key as .env
    python3 augment.py                    # dataset.jsonl -> dataset_augmented.jsonl
    python3 augment.py --variants 8       # more paraphrases per pair

Only the standard library is used — no pip installs needed.
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = os.environ.get("CHAT_MODEL", "llama-3.3-70b-versatile")

PROMPT = """You are augmenting a fine-tuning dataset for a tiny language model
that answers questions about Chaiyo (a Thai software developer).

Given ONE original Q&A pair, produce {n} NEW variants as a JSON array:
[{{"q": "...", "a": "..."}}, ...]

Rules:
- Each variant asks the SAME underlying question with different wording
  (casual, formal, typo-ish, short, indirect, etc.).
- Each answer must keep ALL facts identical to the original answer — never
  invent names, dates, employers, or links.
- Vary the answer wording too: warm, human, first-person bot voice, sometimes
  a light touch of humor. Keep answers 1-3 sentences.
- If the original pair is in Thai, write all variants in Thai. If English,
  make the last variant Thai (translate faithfully).
- Output ONLY the JSON array, no commentary.

Original pair:
Q: {q}
A: {a}
"""


def call_groq(api_key: str, content: str, retries: int = 3) -> str:
    body = json.dumps(
        {
            "model": MODEL,
            "messages": [{"role": "user", "content": content}],
            "temperature": 0.9,
            "max_tokens": 1200,
        }
    ).encode()
    req = urllib.request.Request(
        GROQ_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                data = json.load(res)
            return data["choices"][0]["message"]["content"]
        except Exception as e:  # rate limits etc. — back off and retry
            wait = 5 * (attempt + 1)
            print(f"  … retry in {wait}s ({e})", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError("Groq request kept failing")


def parse_variants(text: str) -> list[dict]:
    match = re.search(r"\[.*\]", text, re.S)  # tolerate stray prose around JSON
    if not match:
        return []
    try:
        items = json.loads(match.group(0))
    except json.JSONDecodeError:
        return []
    out = []
    for it in items:
        q, a = (it.get("q") or "").strip(), (it.get("a") or "").strip()
        if q and a:
            out.append({"q": q, "a": a})
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default="dataset.jsonl")
    ap.add_argument("--output", default="dataset_augmented.jsonl")
    ap.add_argument("--variants", type=int, default=6, help="new pairs per original")
    args = ap.parse_args()

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        sys.exit("Set GROQ_API_KEY first (same key as the chat service).")

    originals = []
    with open(args.input, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            text = json.loads(line)["text"]
            q, a = text.split("\nA:", 1)
            originals.append({"q": q.removeprefix("Q:").strip(), "a": a.strip()})

    print(f"{len(originals)} original pairs → target ~{len(originals) * (args.variants + 1)} total")

    seen = set()
    written = 0
    with open(args.output, "w", encoding="utf-8") as out:

        def emit(q: str, a: str) -> None:
            nonlocal written
            key = q.lower().strip()
            if key in seen:
                return
            seen.add(key)
            out.write(json.dumps({"text": f"Q: {q}\nA: {a}"}, ensure_ascii=False) + "\n")
            written += 1

        for i, pair in enumerate(originals, 1):
            emit(pair["q"], pair["a"])  # always keep the original
            print(f"[{i}/{len(originals)}] {pair['q'][:60]}")
            reply = call_groq(api_key, PROMPT.format(n=args.variants, **pair))
            for v in parse_variants(reply):
                emit(v["q"], v["a"])
            time.sleep(2)  # stay well inside free-tier rate limits

    print(f"Done → {args.output} ({written} pairs). Use this file in the Colab notebook.")


if __name__ == "__main__":
    main()
