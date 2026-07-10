-- Migration 004 — per-bot chat display settings.
-- Adds the background color, font color, and the header title + description a
-- bot owner picks in the dashboard. The embed widget reads them (via
-- GET /api/bot-config?bot=<public_id>) to theme the chat panel and label its
-- header. Run AFTER schema.sql, 002_user_bots.sql, and 003_bot_theme.sql.
--
-- How to apply: Supabase dashboard -> SQL Editor -> paste -> Run. Idempotent.

alter table public.bots
  add column if not exists bg_color   text not null default '#0a0c14',
  add column if not exists font_color text not null default '#eef1f8',
  add column if not exists title       text not null default '',
  add column if not exists description text not null default '';

-- title / description default to '' — the widget falls back to the bot name and
-- its built-in subtitle when they're blank, so existing bots keep their look.
-- Colors are validated in the dashboard/API rather than by a DB constraint, so
-- the app stays the single source of truth and old rows never fail an update.
