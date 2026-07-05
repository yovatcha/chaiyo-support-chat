-- Migration 002 — enable user-created bots.
-- Run AFTER schema.sql, in Supabase -> SQL Editor.
--
-- schema.sql already created the `bots` table + RLS policy
-- ("owners manage own bots": auth.uid() = owner). This migration makes the
-- dashboard insert path work without the client having to supply owner/public_id.

-- The creator becomes the owner automatically (satisfies the RLS check).
alter table public.bots
  alter column owner set default auth.uid();

-- Auto-generate a short unique public embed id (data-bot="...") on insert.
alter table public.bots
  alter column public_id
  set default ('bot_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

-- Owners should not need to know another owner's rows exist. (Policy from
-- schema.sql already scopes select/insert/update/delete to auth.uid() = owner.)
