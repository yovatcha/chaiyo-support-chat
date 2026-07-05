'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Pull the editable bot fields out of a submitted form.
function botFields(formData) {
  return {
    bot_name: String(formData.get('bot_name') || '').trim() || 'Support bot',
    persona: String(formData.get('persona') || '').trim(),
    scope: String(formData.get('scope') || '').trim(),
    fallback_contact: String(formData.get('fallback_contact') || '').trim(),
    knowledge: String(formData.get('knowledge') || ''),
    allowed_origins: String(formData.get('allowed_origins') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export async function createBot(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // owner + public_id are filled by DB defaults (see migration 002).
  const { data, error } = await supabase
    .from('bots')
    .insert(botFields(formData))
    .select('id')
    .single();

  if (error) redirect('/dashboard/bots/new?error=' + encodeURIComponent(error.message));
  redirect('/dashboard/bots/' + data.id);
}

export async function updateBot(id, formData) {
  const supabase = await createClient();
  const { error } = await supabase.from('bots').update(botFields(formData)).eq('id', id);

  if (error) redirect('/dashboard/bots/' + id + '?error=' + encodeURIComponent(error.message));
  revalidatePath('/dashboard/bots/' + id);
  redirect('/dashboard/bots/' + id + '?saved=1');
}

export async function deleteBot(id) {
  const supabase = await createClient();
  await supabase.from('bots').delete().eq('id', id);
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
