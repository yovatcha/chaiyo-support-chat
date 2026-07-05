import { createBot } from '../../actions';
import BotForm from '@/components/BotForm';

export default async function NewBotPage({ searchParams }) {
  const params = await searchParams;
  return (
    <div>
      <h1>New bot</h1>
      {params?.error ? <p className="error">{params.error}</p> : null}
      <BotForm action={createBot} submitLabel="Create bot" />
    </div>
  );
}
