-- Migration 003 — per-bot chat theme color.
-- Adds the accent color a bot owner picks in the dashboard. The embed widget
-- reads it (via GET /api/bot-config?bot=<public_id>) to theme the chat bubble
-- icon + panel. Run AFTER schema.sql and 002_user_bots.sql.
--
-- How to apply: Supabase dashboard -> SQL Editor -> paste -> Run. Idempotent.

alter table public.bots
  add column if not exists accent_color text not null default '#5e85a4';

-- Optional: keep it a sane 6-digit hex. (Skipped as a hard constraint so the
-- dashboard/API validation stays the single source of truth and old rows never
-- fail an update.)
