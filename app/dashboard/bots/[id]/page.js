import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { updateBot, deleteBot } from '../../actions';
import BotForm from '@/components/BotForm';
import CopyEmbed from '@/components/CopyEmbed';
import DeleteBotButton from '@/components/DeleteBotButton';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditBotPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound(); // layout redirects; this just stops the query

  const { data: bot } = await supabase
    .from('bots')
    .select('*')
    .eq('id', id)
    .eq('owner', user.id)
    .maybeSingle();
  if (!bot) notFound();

  // Build the embed origin from the incoming request.
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto =
    h.get('x-forwarded-proto') ||
    (host && (host.startsWith('localhost') || host.startsWith('127.0.0.1')) ? 'http' : 'https');
  const origin = host ? `${proto}://${host}` : '';

  return (
    <div>
      <h1>Edit bot</h1>
      {sp?.saved ? <p className="ok">Saved.</p> : null}
      {sp?.error ? <p className="error">{sp.error}</p> : null}

      <BotForm action={updateBot.bind(null, id)} bot={bot} submitLabel="Save changes" />

      <CopyEmbed publicId={bot.public_id} origin={origin} botName={bot.bot_name} />

      <div className="danger">
        <DeleteBotButton action={deleteBot.bind(null, id)} botName={bot.bot_name} />
      </div>
    </div>
  );
}
