import { createBot } from '../../actions';
import BotForm from '@/components/BotForm';

export default async function NewBotPage({ searchParams }) {
  const params = await searchParams;
  return (
    <div>
      <div className="pagehead">
        <div>
          <span className="mono-label">02 — NEW BOT</span>
          <h1>สร้างบอทใหม่</h1>
        </div>
      </div>
      {params?.error ? <p className="error">{params.error}</p> : null}
      <BotForm action={createBot} submitLabel="สร้างบอท" pendingLabel="กำลังสร้าง…" />
    </div>
  );
}
