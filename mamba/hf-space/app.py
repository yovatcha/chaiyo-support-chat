# FastAPI server for the fine-tuned Yo-bot Mamba — deploy as a Hugging Face
# Docker Space (free CPU tier). Exposes POST /chat with the same request/
# response shape as /api/chat, so the portfolio widget can toggle between them.

import os
import threading

import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = os.environ.get("MODEL_ID", "yovatcha/yo-bot-mamba-130m")
# Lock CORS to your portfolio domain(s) once deployed:
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(title="Yo-bot Mamba")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

print(f"Loading {MODEL_ID} …")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(MODEL_ID, torch_dtype=torch.float32)
model.eval()
lock = threading.Lock()  # one generation at a time on free CPU
print("Ready.")


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@app.get("/")
def health():
    return {"ok": True, "model": MODEL_ID}


@app.post("/chat")
def chat(req: ChatRequest):
    users = [m for m in req.messages if m.role == "user" and m.content.strip()]
    if not users:
        return {"error": "messages[] must contain a user message"}
    question = users[-1].content.strip()[:300]

    prompt = f"Q: {question}\nA:"
    inputs = tokenizer(prompt, return_tensors="pt")
    with lock, torch.no_grad():
        out = model.generate(
            **inputs,
            max_new_tokens=90,
            # Sampling (vs greedy) makes replies feel human instead of robotic.
            # Tune via env vars without redeploying code.
            do_sample=True,
            temperature=float(os.environ.get("TEMPERATURE", "0.7")),
            top_p=float(os.environ.get("TOP_P", "0.9")),
            repetition_penalty=float(os.environ.get("REPETITION_PENALTY", "1.3")),
            eos_token_id=tokenizer.eos_token_id,
        )
    text = tokenizer.decode(out[0], skip_special_tokens=True)
    reply = text.split("A:", 1)[-1].strip()
    # A tiny model sometimes keeps generating new Q/A pairs — cut at the first.
    reply = reply.split("\nQ:", 1)[0].strip() or "…(the tiny model is speechless)"
    return {"reply": reply, "model": f"{MODEL_ID.split('/')[-1]} (fine-tuned by Chaiyo)"}
