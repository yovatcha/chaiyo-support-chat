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
        ลบบอทนี้
      </button>
    );
  }

  return (
    <form action={action} className="delete-confirm">
      <p className="muted small">
        ลบ <strong>{botName || 'บอทนี้'}</strong> ใช่ไหม เว็บไซต์ที่ติดตั้งบอทนี้จะใช้งานไม่ได้ทันที
        และไม่สามารถกู้คืนได้
      </p>
      <SubmitButton className="btn danger" pendingLabel="กำลังลบ…">
        ใช่ ลบเลย
      </SubmitButton>{' '}
      <button type="button" className="link" onClick={() => setArmed(false)}>
        ยกเลิก
      </button>
    </form>
  );
}
