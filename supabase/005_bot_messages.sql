-- Migration 005 — per-bot opening message + input placeholder.
-- Adds the greeting the chat shows when it opens and the text-field placeholder.
-- The embed widget reads them (via GET /api/bot-config?bot=<public_id>); when
-- blank it falls back to a neutral, name-based default. Run AFTER 004.
--
-- How to apply: Supabase dashboard -> SQL Editor -> paste -> Run. Idempotent.

alter table public.bots
  add column if not exists greeting    text not null default '',
  add column if not exists placeholder text not null default '';

-- Preserve the portfolio bot's original Thai copy (the built-in fallback is now
-- generic, so pin its bespoke greeting/placeholder here). Only sets them if the
-- owner hasn't already customized them.
update public.bots
set
  greeting = coalesce(nullif(greeting, ''),
    'สวัสดีครับ! ผม Yo-bot 🤖 ถามอะไรเกี่ยวกับไชโยได้เลย — งาน สกิล โปรเจกต์ หรือช่องทางติดต่อครับ'),
  placeholder = coalesce(nullif(placeholder, ''), 'ถามเรื่องไชโย…')
where public_id = 'portfolio';
