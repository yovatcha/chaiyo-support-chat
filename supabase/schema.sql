-- Yo-bot platform — database schema (Supabase / Postgres).
--
-- This replaces the git-committed sites/ registry: every chatbot is now a row
-- in `bots`, so users can create and edit their own bots from a dashboard
-- instead of a developer editing files and redeploying.
--
-- How to apply: Supabase dashboard -> SQL Editor -> paste this file -> Run.
-- (Re-runnable: uses IF NOT EXISTS / idempotent policies.)

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- bots: one row per chatbot (one "tenant"). The single source of truth a
-- bot answers from in manual mode is the `knowledge` text column.
-- ---------------------------------------------------------------------------
create table if not exists public.bots (
  id                uuid primary key default gen_random_uuid(),
  public_id         text unique not null,            -- goes in the embed: data-bot="..."
  owner             uuid references auth.users(id) on delete cascade,
  bot_name          text not null default 'Support bot',
  persona           text not null,                   -- who the bot is / its job
  scope             text not null,                   -- what counts as on-topic
  fallback_contact  text not null,                   -- where to send people when it doesn't know
  knowledge         text not null default '',        -- everything the bot knows (context-stuffed)
  allowed_origins   text[] not null default '{}',    -- empty = allow any site (MVP default)
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

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
-- Row-level security.
-- The dashboard talks to Supabase with the logged-in USER's token, so users
-- can only see/edit their own bots. The chat endpoint (/api/chat) reads with
-- the SERVICE ROLE key, which bypasses RLS — so no public read policy is
-- needed here, and anon visitors can never list bots.
-- ---------------------------------------------------------------------------
alter table public.bots enable row level security;

drop policy if exists "owners manage own bots" on public.bots;
create policy "owners manage own bots"
  on public.bots
  for all
  using (auth.uid() = owner)
  with check (auth.uid() = owner);

-- ---------------------------------------------------------------------------
-- Seed: the portfolio bot becomes tenant #1 (owner NULL = unclaimed demo row).
-- This proves the read path immediately, before any dashboard exists.
-- Mirrors sites/portfolio/config.js + knowledge.js.
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
- This was his step up from solo projects to shipping and maintaining
  real software at scale in fast, collaborative agile cycles.

## Past experience
- Full-stack Developer (internship) at DevForward.tech, June — August 2024.
  First professional role. Built a client's web product end-to-end with
  Next.js and PHP, worked with business analysts and designers on UX,
  wired up and monitored APIs, refactored for performance and reliability.

## Education
- B.Sc. Computer Science, King Mongkut's University of Technology Thonburi
  (KMUTT), 2021 — 2024.
- Thesis project: LostNFound — a campus lost-and-found platform that matches
  reports using an NLP algorithm. Built with Next.js, FastAPI, PostgreSQL.
- Senior high school: Satit Prasarnmit Demonstration School (secondary),
  Computer Major, 2018 — 2020. Where he wrote his first code.

## Highlighted projects
1. Gig&Co (https://gigandco.work/) — workforce marketplace platform bridging
   businesses and gig workers: recruit, manage, and pay temporary staff in one
   platform. Tech: Vite + TypeScript, Node, Flutter.
2. Thailand Election 2569 (https://election69.dailynews.co.th/) — real-time
   election results platform built for Daily News covering Thailand's 2026
   general election and referendum. Live vote counts by candidate, party, and
   constituency on an interactive WebGL map of Thailand; Scala backend
   aggregating a continuous results feed with sub-second updates to a React
   front end that stayed stable under a massive nationwide traffic spike.
3. LostNFound — university thesis (see Education).
4. This portfolio itself — a Three.js particle-scene site built with Vite,
   plus this AI support chat he built (Groq-powered grounded generation, and
   a Mamba language model he fine-tuned himself as a showcase).

## Skills (self-rated, 5 = strongest)
- Frontend & Mobile: React (5), Next.js (5), TypeScript (5), JavaScript (5),
  HTML/CSS (4), Tailwind CSS (4), shadcn/ui (4), Flutter (3), Three.js (2)
- Backend & Data: Prisma ORM (5), PostgreSQL (4), Node.js (3), Go (2),
  Express (2), Ruby on Rails (2)
- DevOps: Docker (3), Linux (3), CI/CD (3), Kubernetes (1)
- Design & Product: Figma (5), Design Systems (4), UX/UI Design (4),
  Agile/Scrum (4), Product Thinking (4), Technical Communication (4),
  Requirements Analysis (4), Illustrator (3)

## Contact & links
- Email: yoyo.rodring@gmail.com
- GitHub: https://github.com/yovatcha
- LinkedIn: https://www.linkedin.com/in/vatcharamai-rodring/
- Instagram: https://www.instagram.com/yovatcha/
- Facebook: https://www.facebook.com/vatcharamai.rodring/
- CV: downloadable from the portfolio's contact section.
- Availability: open to interesting projects and conversations — "my inbox
  is always open."

## Personality / extras
- Loves music; the portfolio has a "Now Playing" section pulling from his
  Spotify playlists.
- Interested in ML/AI — learned about state-space models (Mamba) and
  fine-tuned one on his own data for this chat's showcase mode.

## ข้อมูลภาษาไทย (canonical Thai spellings — use these EXACTLY when replying in Thai)
- ชื่อ-นามสกุล: วัชรมัย รอดหริ่ง
- วันเกิด: 21 กันยายน 2545
- ชื่อเล่น: ไชโย (หรือเรียกสั้น ๆ ว่า "โย")
- เกิด: 21 กันยายน 2545 (ค.ศ. 2002)
- ตำแหน่ง: นักพัฒนาซอฟต์แวร์ (Software Developer) ที่บริษัท ODT ตั้งแต่มกราคม 2568 (2025)
- งานที่ ODT: อยู่ทีม Scrum ดูแลโปรดักต์ขนาดใหญ่ ได้แก่ Gig&Co, ระบบ Blocktrade และ KKP Tax Planner
- ฝึกงาน: Full-stack Developer ที่ DevForward.tech (มิ.ย.–ส.ค. 2567/2024) ทำเว็บลูกค้าด้วย Next.js และ PHP
- การศึกษา: วท.บ. วิทยาการคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (มจธ. / KMUTT) ปี 2564–2567 (2021–2024)
- ธีสิส: LostNFound — แพลตฟอร์มของหายได้คืนในมหาวิทยาลัย ใช้อัลกอริทึม NLP จับคู่รายงาน (Next.js, FastAPI, PostgreSQL)
- มัธยม: โรงเรียนสาธิต มศว ประสานมิตร (ฝ่ายมัธยม) สายคอมพิวเตอร์ ปี 2561–2563
- โปรเจกต์เด่น: Gig&Co (แพลตฟอร์มจ้างงาน gig), เว็บรายงานผลเลือกตั้ง 2569 แบบเรียลไทม์ให้เดลินิวส์, LostNFound, และเว็บพอร์ตโฟลิโอ Three.js
- ติดต่อ: อีเมล yoyo.rodring@gmail.com
$knowledge$
)
on conflict (public_id) do nothing;
