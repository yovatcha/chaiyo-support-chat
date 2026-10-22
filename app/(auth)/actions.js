'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { siteOrigin, RECOVERY_COOKIE } from '@/lib/auth';
import { authErrorMessage } from '@/lib/auth-messages';

const MIN_PASSWORD = 8;

function read(formData, key) {
  return String(formData.get(key) || '').trim();
}

function back(path, params) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v)
  );
  redirect(search.size ? `${path}?${search}` : path);
}

export async function login(formData) {
  const email = read(formData, 'email');
  const password = String(formData.get('password') || '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // An unconfirmed account isn't a credentials problem — send them somewhere
    // they can actually do something about it. Older gotrue builds report this
    // only in the message, so match on both.
    const unconfirmed =
      error.code === 'email_not_confirmed' ||
      /email not confirmed/i.test(error.message || '');
    if (unconfirmed) back('/check-email', { email, reason: 'unconfirmed' });

    back('/login', { error: authErrorMessage(error), email });
  }

  redirect('/dashboard');
}

export async function signup(formData) {
  const email = read(formData, 'email');
  const password = String(formData.get('password') || '');

  if (password.length < MIN_PASSWORD) {
    back('/signup', {
      error: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัวอักษร`,
      email,
    });
  }

  const origin = await siteOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
  });

  if (error) back('/signup', { error: authErrorMessage(error), email });

  // Email confirmation turned OFF in Supabase — signUp already returned a
  // session, so skip the check-your-email step entirely.
  if (data.session) redirect('/dashboard');

  back('/check-email', { email });
}

export async function resendConfirmation(formData) {
  const email = read(formData, 'email');
  if (!email) back('/check-email', { error: 'กรุณากรอกอีเมลก่อน' });

  const origin = await siteOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
  });

  if (error) back('/check-email', { email, error: authErrorMessage(error, 'ส่งลิงก์ไม่สำเร็จ กรุณาลองอีกครั้ง') });
  back('/check-email', { email, sent: '1' });
}

export async function requestPasswordReset(formData) {
  const email = read(formData, 'email');

  const origin = await siteOrigin();
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  // Always report the same thing, whether or not the address has an account —
  // otherwise this endpoint tells strangers who is registered.
  back('/forgot-password', { email, sent: '1' });
}

export async function updatePassword(formData) {
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm') || '');

  if (password.length < MIN_PASSWORD) {
    back('/reset-password', {
      error: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัวอักษร`,
    });
  }
  if (password !== confirm) {
    back('/reset-password', { error: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only a session that arrived through a recovery link may set a password
  // without knowing the old one. The auth callback sets this cookie; an
  // ordinary login session (or a stolen cookie) does not carry it.
  const jar = await cookies();
  const viaRecovery = jar.get(RECOVERY_COOKIE)?.value === '1';
  if (!user || !viaRecovery) {
    back('/auth-error', {
      reason: 'ลิงก์ตั้งรหัสผ่านหมดอายุแล้ว กรุณาขอลิงก์ใหม่',
    });
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) back('/reset-password', { error: authErrorMessage(error, 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองอีกครั้ง') });

  jar.delete(RECOVERY_COOKIE);
  back('/login', { notice: 'เปลี่ยนรหัสผ่านแล้ว เข้าสู่ระบบด้วยรหัสผ่านใหม่' });
}
