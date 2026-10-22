'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { LIMITS } from '@/lib/bot-limits';

const DEFAULT_ACCENT = '#5e85a4';
const DEFAULT_BG = '#0a0c14';
const DEFAULT_FONT = '#eef1f8';
const HEX = /^#[0-9a-fA-F]{6}$/;

class FormError extends Error {}

const FIELD_LABELS = {
  bot_name: 'ชื่อบอท',
  title: 'หัวข้อ',
  description: 'คำอธิบายสั้น',
  greeting: 'ข้อความทักทาย',
  placeholder: 'ข้อความในช่องพิมพ์',
  accent_color: 'สีเน้น',
  bg_color: 'สีพื้นหลัง',
  font_color: 'สีตัวอักษร',
  persona: 'บุคลิกบอท',
  scope: 'ขอบเขต',
  fallback_contact: 'ช่องทางติดต่อสำรอง',
  knowledge: 'ความรู้',
};

function str(formData, name) {
  return String(formData.get(name) || '').trim();
}

function capped(formData, name, { required = false } = {}) {
  const v = str(formData, name);
  if (required && !v) throw new FormError(`กรุณากรอก${label(name)}`);
  if (v.length > LIMITS[name]) {
    throw new FormError(`${label(name)}ยาวเกินไป (สูงสุด ${LIMITS[name].toLocaleString('th-TH')} ตัวอักษร)`);
  }
  return v;
}

function label(name) {
  return FIELD_LABELS[name] || name.replace(/_/g, ' ');
}

// A colour must be a 6-digit hex; blank means "use the default".
function hexField(formData, name, fallback) {
  const v = str(formData, name).toLowerCase();
  if (!v) return fallback;
  if (!HEX.test(v)) throw new FormError(`${label(name)}ไม่ถูกต้อง ใช้รหัส hex 6 หลัก เช่น #5e85a4`);
  return v;
}

// Origins are stored normalised (scheme://host[:port], lower-case, no path)
// because /api/chat compares them exactly against the browser's Origin header.
function originsField(formData) {
  const raw = str(formData, 'allowed_origins');
  if (!raw) return [];
  const out = [];
  for (const piece of raw.split(/[,\s]+/).filter(Boolean)) {
    let url;
    try {
      url = new URL(/^https?:\/\//i.test(piece) ? piece : `https://${piece}`);
    } catch {
      throw new FormError(`“${piece}” ไม่ใช่โดเมนเว็บที่ถูกต้อง`);
    }
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') {
      throw new FormError(`“${piece}” ไม่ใช่โดเมนเว็บที่ถูกต้อง`);
    }
    if (!out.includes(url.origin)) out.push(url.origin);
  }
  if (out.length > LIMITS.allowed_origins) {
    throw new FormError(`ระบุโดเมนได้ไม่เกิน ${LIMITS.allowed_origins} โดเมน`);
  }
  return out;
}

// Pull and validate the editable bot fields out of a submitted form.
function botFields(formData) {
  return {
    bot_name: capped(formData, 'bot_name') || 'บอทช่วยเหลือ',
    title: capped(formData, 'title'),
    description: capped(formData, 'description'),
    greeting: capped(formData, 'greeting'),
    placeholder: capped(formData, 'placeholder'),
    accent_color: hexField(formData, 'accent_color', DEFAULT_ACCENT),
    bg_color: hexField(formData, 'bg_color', DEFAULT_BG),
    font_color: hexField(formData, 'font_color', DEFAULT_FONT),
    persona: capped(formData, 'persona', { required: true }),
    scope: capped(formData, 'scope', { required: true }),
    fallback_contact: capped(formData, 'fallback_contact', { required: true }),
    knowledge: capped(formData, 'knowledge', { required: true }),
    allowed_origins: originsField(formData),
  };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}

function fail(path, message) {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

// Turn a validation or database failure into a message safe to show.
function describe(err) {
  if (err instanceof FormError) return err.message;
  console.error('bot action error', err);
  return 'บันทึกบอทไม่สำเร็จ กรุณาลองอีกครั้ง';
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createBot(formData) {
  const { supabase, user } = await requireUser();

  let fields;
  try {
    fields = botFields(formData);
  } catch (err) {
    fail('/dashboard/bots/new', describe(err));
  }

  // public_id is filled by the DB default (see supabase/setup.sql).
  const { data, error } = await supabase
    .from('bots')
    .insert({ ...fields, owner: user.id })
    .select('id')
    .single();

  if (error || !data) fail('/dashboard/bots/new', describe(error));
  revalidatePath('/dashboard');
  redirect('/dashboard/bots/' + data.id);
}

export async function updateBot(id, formData) {
  const { supabase, user } = await requireUser();
  if (!UUID.test(String(id))) redirect('/dashboard');
  const page = '/dashboard/bots/' + id;

  let fields;
  try {
    fields = botFields(formData);
  } catch (err) {
    fail(page, describe(err));
  }

  // Scope to the owner explicitly (on top of RLS) and ask for the row back so
  // "nothing matched" is reported instead of showing a false "Saved."
  const { data, error } = await supabase
    .from('bots')
    .update(fields)
    .eq('id', id)
    .eq('owner', user.id)
    .select('id');

  if (error) fail(page, describe(error));
  if (!data || data.length === 0) fail(page, 'ไม่พบบอทนี้ หรือคุณไม่มีสิทธิ์แก้ไข');

  revalidatePath('/dashboard');
  revalidatePath(page);
  redirect(page + '?saved=1');
}

export async function deleteBot(id) {
  const { supabase, user } = await requireUser();
  if (!UUID.test(String(id))) redirect('/dashboard');

  const { data, error } = await supabase
    .from('bots')
    .delete()
    .eq('id', id)
    .eq('owner', user.id)
    .select('id');

  if (error) fail('/dashboard/bots/' + id, describe(error));
  if (!data || data.length === 0) fail('/dashboard/bots/' + id, 'ไม่พบบอทนี้ หรือคุณไม่มีสิทธิ์ลบ');

  revalidatePath('/dashboard');
  redirect('/dashboard?deleted=1');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
