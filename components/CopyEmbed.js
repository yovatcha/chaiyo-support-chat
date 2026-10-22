'use client';

import { useState } from 'react';

export default function CopyEmbed({ publicId, origin, botName }) {
  const src = (origin || 'https://YOUR-DOMAIN') + '/yo-bot.js';
  const snippet =
    `<script src="${src}"\n        data-bot="${publicId}"\n        data-bot-name="${botName || 'บอทช่วยเหลือ'}" defer></script>`;

  const [copyState, setCopyState] = useState('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1500);
    } catch {
      setCopyState('error');
    }
  }

  return (
    <section className="embed frame">
      <div className="form-sec-head"><span className="mono-idx">05</span><h2>โค้ดติดตั้ง</h2></div>
      <p className="muted small">วางโค้ดนี้ก่อนแท็ก &lt;/body&gt; ในหน้าเว็บไซต์ที่ต้องการ</p>
      <pre>{snippet}</pre>
      <button type="button" className="btn" onClick={copy}>
        {copyState === 'copied' ? 'คัดลอกแล้ว ✓' : copyState === 'error' ? 'คัดลอกไม่สำเร็จ' : 'คัดลอกโค้ด'}
      </button>
    </section>
  );
}
