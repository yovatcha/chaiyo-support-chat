import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { updateBot, deleteBot } from '../../actions';
import BotForm from '@/components/BotForm';
import CopyEmbed from '@/components/CopyEmbed';

export default async function EditBotPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;

  const supabase = await createClient();
  const { data: bot } = await supabase.from('bots').select('*').eq('id', id).single();
  if (!bot) notFound();

  // Build the embed origin from the incoming request.
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  const origin = host ? `${proto}://${host}` : '';

  return (
    <div>
      <h1>Edit bot</h1>
      {sp?.saved ? <p className="ok">Saved.</p> : null}
      {sp?.error ? <p className="error">{sp.error}</p> : null}

      <BotForm action={updateBot.bind(null, id)} bot={bot} submitLabel="Save changes" />

      <CopyEmbed publicId={bot.public_id} origin={origin} botName={bot.bot_name} />

      <form action={deleteBot.bind(null, id)} className="danger">
        <button className="link danger">Delete this bot</button>
      </form>
    </div>
  );
}
