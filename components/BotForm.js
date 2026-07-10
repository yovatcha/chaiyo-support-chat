// Reusable bot create/edit form. Server component — just renders fields bound
// to a server action passed in by the page.

import Appearance from '@/components/Appearance';

export default function BotForm({ action, bot = {}, submitLabel }) {
  return (
    <form action={action} className="botform">
      <label>
        Bot name
        <input name="bot_name" defaultValue={bot.bot_name || ''} placeholder="Acme Support" />
      </label>

      <label>
        Persona — who the bot is and its job
        <textarea
          name="persona"
          rows={4}
          required
          defaultValue={bot.persona || ''}
          placeholder="You are Acme's support assistant. Answer questions about Acme's products, plans, and account help. Be friendly and speak in first person."
        />
      </label>

      <label>
        Scope — what counts as on-topic
        <input
          name="scope"
          required
          defaultValue={bot.scope || ''}
          placeholder="questions about Acme — products, pricing, and support"
        />
      </label>

      <label>
        Fallback contact — where to send people when it doesn&apos;t know
        <input
          name="fallback_contact"
          required
          defaultValue={bot.fallback_contact || ''}
          placeholder="email support@acme.com"
        />
      </label>

      <label>
        Knowledge — everything the bot should know
        <textarea
          name="knowledge"
          rows={14}
          required
          defaultValue={bot.knowledge || ''}
          placeholder="Paste your FAQ, docs, product details, hours, policies… Plain text is fine."
        />
      </label>

      <label>
        Allowed website origins — optional, comma-separated (empty = any site)
        <input
          name="allowed_origins"
          defaultValue={(bot.allowed_origins || []).join(', ')}
          placeholder="https://acme.com, https://www.acme.com"
        />
      </label>

      <Appearance bot={bot} />

      <button type="submit" className="btn">{submitLabel}</button>
    </form>
  );
}
