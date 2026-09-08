'use client';

import { useState } from 'react';
import SubmitButton from '@/components/SubmitButton';

// Two-step delete: the first click reveals a confirmation, the second submits
// the bound server action. No native confirm() dialog.
export default function DeleteBotButton({ action, botName }) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button type="button" className="link danger" onClick={() => setArmed(true)}>
        Delete this bot
      </button>
    );
  }

  return (
    <form action={action} className="delete-confirm">
      <p className="muted small">
        Delete <strong>{botName || 'this bot'}</strong>? Any site embedding it stops working immediately.
        This cannot be undone.
      </p>
      <SubmitButton className="btn danger" pendingLabel="Deleting…">
        Yes, delete it
      </SubmitButton>{' '}
      <button type="button" className="link" onClick={() => setArmed(false)}>
        Cancel
      </button>
    </form>
  );
}
