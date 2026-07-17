'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { siteOrigin } from '@/lib/auth';

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

    back('/login', { error: error.message, email });
  }

  redirect('/dashboard');
}

export async function signup(formData) {
  const email = read(formData, 'email');
  const password = String(formData.get('password') || '');

  if (password.length < MIN_PASSWORD) {
    back('/signup', {
      error: `Password must be at least ${MIN_PASSWORD} characters.`,
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

  if (error) back('/signup', { error: error.message, email });

  // Email confirmation turned OFF in Supabase — signUp already returned a
  // session, so skip the check-your-email step entirely.
  if (data.session) redirect('/dashboard');

  back('/check-email', { email });
}

export async function resendConfirmation(formData) {
  const email = read(formData, 'email');
  if (!email) back('/check-email', { error: 'Enter your email address first.' });

  const origin = await siteOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
  });

  if (error) back('/check-email', { email, error: error.message });
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
      error: `Password must be at least ${MIN_PASSWORD} characters.`,
    });
  }
  if (password !== confirm) {
    back('/reset-password', { error: 'Those passwords don’t match.' });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The recovery link is what grants the session used here. No session means
  // the link was never followed, or it expired.
  if (!user) {
    back('/auth-error', {
      reason: 'Your reset link has expired. Request a new one.',
    });
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) back('/reset-password', { error: error.message });

  back('/login', { notice: 'Password updated. Sign in with your new password.' });
}
