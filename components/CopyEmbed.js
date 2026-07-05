'use client';

import { useState } from 'react';

export default function CopyEmbed({ publicId, origin, botName }) {
  const src = (origin || 'https://YOUR-DOMAIN') + '/yo-bot.js';
  const snippet =
    `<script src="${src}"\n        data-bot="${publicId}"\n        data-bot-name="${botName || 'Support bot'}" defer></script>`;

  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — user can still select the text manually
    }
  }

  return (
    <section className="embed">
      <h2>Embed snippet</h2>
      <p className="muted small">Paste this into any page of your website.</p>
      <pre>{snippet}</pre>
      <button type="button" className="btn" onClick={copy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </section>
  );
}
