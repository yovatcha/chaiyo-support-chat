'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/login?error=' + encodeURIComponent(error.message));

  redirect('/dashboard');
}

export async function signup(formData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) redirect('/login?error=' + encodeURIComponent(error.message));

  // With email confirmation OFF (recommended for local testing) signUp returns
  // a session and the dashboard opens. With confirmation ON, the user must
  // click the email link first, then sign in.
  redirect('/dashboard');
}
