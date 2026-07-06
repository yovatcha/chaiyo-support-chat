-- Yo-bot platform — one-and-done database setup (idempotent).
-- Supabase -> SQL Editor -> paste this whole file -> Run. Safe to re-run.
-- This REPLACES running schema.sql + 002_user_bots.sql separately.

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- bots: one row per chatbot (one tenant). Defaults let the dashboard insert a
-- row without supplying owner or public_id.
-- ---------------------------------------------------------------------------
create table if not exists public.bots (
  id                uuid primary key default gen_random_uuid(),
  public_id         text unique not null
                      default ('bot_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  owner             uuid references auth.users(id) on delete cascade default auth.uid(),
  bot_name          text not null default 'Support bot',
  persona           text not null,
  scope             text not null,
  fallback_contact  text not null,
  knowledge         text not null default '',
  allowed_origins   text[] not null default '{}',
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Ensure the defaults exist even if the table was created by an older script.
alter table public.bots alter column owner set default auth.uid();
alter table public.bots
  alter column public_id
  set default ('bot_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

create index if not exists bots_public_id_idx on public.bots (public_id);
create index if not exists bots_owner_idx     on public.bots (owner);

-- Keep updated_at fresh on every change.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bots_touch_updated_at on public.bots;
create trigger bots_touch_updated_at
  before update on public.bots
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security: a logged-in user only sees/edits their own bots.
-- The chat endpoint reads with the service-role key (bypasses RLS).
-- ---------------------------------------------------------------------------
alter table public.bots enable row level security;

drop policy if exists "owners manage own bots" on public.bots;
create policy "owners manage own bots"
  on public.bots for all
  using (auth.uid() = owner)
  with check (auth.uid() = owner);

-- ---------------------------------------------------------------------------
-- Seed the portfolio demo bot (owner NULL = unclaimed; powers the landing demo).
-- ---------------------------------------------------------------------------
insert into public.bots (public_id, bot_name, persona, scope, fallback_contact, knowledge)
values (
  'portfolio',
  'Yo-bot',
  $persona$You are "Yo-bot", the AI assistant on Chaiyo's portfolio website.
Your job: answer visitors' questions about Chaiyo (Vatcharamai Rodring) —
his work, skills, projects, background, and how to contact him.
Speak in first person about yourself but third person about Chaiyo.
In Thai you are a male bot: use the polite particle "ครับ".$persona$,
  'questions about Chaiyo — his work, skills, projects, background, and contact info',
  'email Chaiyo directly at yoyo.rodring@gmail.com',
  $knowledge$
# About Chaiyo

## Identity
- Full name: Vatcharamai Rodring
- Nickname: Chaiyo (also goes by "Yo")
- Born: 21 September 2002
- Role: Software Developer
- Based in: Thailand
- Tagline: "Working as a Software Developer, with a limitless passion for learning and growing every day."

## Current job
- Software Developer at ODT (full-time, Jan 2025 — present)
- Works in a Scrum team delivering large-scale production products:
  Gig&Co, the Blocktrade system, and the KKP Tax Planner.

## Past experience
- Full-stack Developer (internship) at DevForward.tech, June — August 2024.
  Built a client's web product end-to-end with Next.js and PHP.

## Education
- B.Sc. Computer Science, King Mongkut's University of Technology Thonburi
  (KMUTT), 2021 — 2024.
- Thesis: LostNFound — a campus lost-and-found platform that matches reports
  using an NLP algorithm. Built with Next.js, FastAPI, PostgreSQL.

## Highlighted projects
1. Gig&Co (https://gigandco.work/) — workforce marketplace platform. Tech: Vite + TypeScript, Node, Flutter.
2. Thailand Election 2569 (https://election69.dailynews.co.th/) — real-time election results platform for Daily News; Scala backend, React front end on a WebGL map.
3. LostNFound — university thesis (see Education).
4. This portfolio — a Three.js particle-scene site, plus this AI support chat (Groq-grounded generation, and a Mamba model he fine-tuned as a showcase).

## Skills (self-rated, 5 = strongest)
- Frontend & Mobile: React (5), Next.js (5), TypeScript (5), JavaScript (5), HTML/CSS (4), Tailwind CSS (4), shadcn/ui (4), Flutter (3), Three.js (2)
- Backend & Data: Prisma ORM (5), PostgreSQL (4), Node.js (3), Go (2), Express (2), Ruby on Rails (2)
- DevOps: Docker (3), Linux (3), CI/CD (3), Kubernetes (1)
- Design & Product: Figma (5), Design Systems (4), UX/UI (4), Agile/Scrum (4)

## Contact & links
- Email: yoyo.rodring@gmail.com
- GitHub: https://github.com/yovatcha
- LinkedIn: https://www.linkedin.com/in/vatcharamai-rodring/
- Instagram: https://www.instagram.com/yovatcha/
- Availability: open to interesting projects — "my inbox is always open."

## ข้อมูลภาษาไทย (canonical Thai spellings — use these EXACTLY when replying in Thai)
- ชื่อ-นามสกุล: วัชรมัย รอดหริ่ง
- ชื่อเล่น: ไชโย (หรือเรียกสั้น ๆ ว่า "โย")
- วันเกิด: 21 กันยายน 2545 (ค.ศ. 2002)
- ตำแหน่ง: นักพัฒนาซอฟต์แวร์ (Software Developer) ที่บริษัท ODT ตั้งแต่มกราคม 2568 (2025)
- งานที่ ODT: อยู่ทีม Scrum ดูแลโปรดักต์ขนาดใหญ่ ได้แก่ Gig&Co, ระบบ Blocktrade และ KKP Tax Planner
- การศึกษา: วท.บ. วิทยาการคอมพิวเตอร์ มจธ. (KMUTT) ปี 2564–2567
- ติดต่อ: อีเมล yoyo.rodring@gmail.com
$knowledge$
)
on conflict (public_id) do nothing;
