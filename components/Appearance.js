'use client';

// Appearance section for the bot editor — the header title/description plus the
// accent, background, and font colors. Everything is held in one piece of state
// so the live preview mirrors exactly how the embed widget will look, and
// hidden inputs carry the values into the surrounding server-action <form>.

import { useState } from 'react';
import ColorPicker from '@/components/ColorPicker';

const HEX = /^#[0-9a-fA-F]{6}$/;

const DEFAULTS = { accent: '#5e85a4', bg: '#0a0c14', font: '#eef1f8' };

const ACCENT_PRESETS = [
  { name: 'Slate', value: '#5e85a4' },
  { name: 'Red', value: '#cc2b22' },
  { name: 'Gold', value: '#e1b341' },
  { name: 'Green', value: '#2f9e6b' },
  { name: 'Violet', value: '#7c5cff' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Ink', value: '#1a1b1e' },
];

const BG_PRESETS = [
  { name: 'Midnight', value: '#0a0c14' },
  { name: 'Charcoal', value: '#1a1b1e' },
  { name: 'Slate', value: '#23272f' },
  { name: 'Ocean', value: '#0f2233' },
  { name: 'Ivory', value: '#f7f4ee' },
  { name: 'White', value: '#ffffff' },
];

const FONT_PRESETS = [
  { name: 'Snow', value: '#eef1f8' },
  { name: 'White', value: '#ffffff' },
  { name: 'Cloud', value: '#c7cedd' },
  { name: 'Graphite', value: '#3a3d44' },
  { name: 'Ink', value: '#1a1b1e' },
];

function hexToRgb(h) {
  const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
  if (!m) return null;
  const i = parseInt(m[1], 16);
  return { r: (i >> 16) & 255, g: (i >> 8) & 255, b: i & 255 };
}
function luminance(hex) {
  const c = hexToRgb(hex);
  return c ? (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255 : 0;
}
// Mirror of the widget's contrast logic so the user bubble reads the same.
function readableOn(hex) {
  return luminance(hex) > 0.6 ? '#1a1b1e' : '#ffffff';
}
function lighten(hex, amt) {
  const c = hexToRgb(hex);
  if (!c) return hex;
  const comp = (x) => Math.round(x).toString(16).padStart(2, '0');
  return '#' + comp(c.r + (255 - c.r) * amt) + comp(c.g + (255 - c.g) * amt) + comp(c.b + (255 - c.b) * amt);
}
function rgba(hex, a) {
  const c = hexToRgb(hex);
  return c ? `rgba(${c.r},${c.g},${c.b},${a})` : hex;
}

export default function Appearance({ bot = {} }) {
  const [title, setTitle] = useState(bot.title || '');
  const [description, setDescription] = useState(bot.description || '');
  const [accent, setAccent] = useState(HEX.test(bot.accent_color || '') ? bot.accent_color : DEFAULTS.accent);
  const [bg, setBg] = useState(HEX.test(bot.bg_color || '') ? bot.bg_color : DEFAULTS.bg);
  const [font, setFont] = useState(HEX.test(bot.font_color || '') ? bot.font_color : DEFAULTS.font);

  // Derived tones for the preview (match the widget's own derivations).
  const bgLight = luminance(bg) > 0.6;
  const card = bgLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
  const border = bgLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)';
  const muted = rgba(font, 0.6);
  const accent2 = lighten(accent, 0.18);
  const accentFg = readableOn(accent);

  const headTitle = title.trim() || bot.bot_name || 'Support bot';
  const headSub = description.trim() || 'AI support · ask me anything';

  return (
    <section className="appearance">
      <h2>Appearance</h2>
      <p className="muted small">
        How the chat window looks and reads on your site. Changes preview live below.
      </p>

      <input type="hidden" name="accent_color" value={accent} />
      <input type="hidden" name="bg_color" value={bg} />
      <input type="hidden" name="font_color" value={font} />

      <div className="appearance-grid">
        <div className="appearance-controls">
          <label>
            Title — heading at the top of the chat window
            <input
              name="title"
              maxLength={60}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={bot.bot_name || 'Support bot'}
            />
          </label>

          <label>
            Description — the small line under the title
            <input
              name="description"
              maxLength={120}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="AI support · ask me anything"
            />
          </label>

          <div className="field">
            <span className="field-label">Accent — chat bubble, icon &amp; Send button</span>
            <ColorPicker value={accent} onChange={setAccent} presets={ACCENT_PRESETS} />
          </div>

          <div className="field">
            <span className="field-label">Background — the chat window colour</span>
            <ColorPicker value={bg} onChange={setBg} presets={BG_PRESETS} />
          </div>

          <div className="field">
            <span className="field-label">Font — the message text colour</span>
            <ColorPicker value={font} onChange={setFont} presets={FONT_PRESETS} />
          </div>
        </div>

        {/* Live preview — a miniature of the embed widget's panel. */}
        <div className="appearance-preview" aria-hidden="true">
          <div className="cp-panel" style={{ background: bg, color: font, borderColor: border }}>
            <div className="cp-head" style={{ borderColor: border }}>
              <span className="cp-dot" style={{ background: accent2, boxShadow: `0 0 8px ${accent2}` }} />
              <div>
                <div className="cp-title" style={{ color: font }}>{headTitle}</div>
                <div className="cp-sub" style={{ color: muted }}>{headSub}</div>
              </div>
            </div>
            <div className="cp-log">
              <div className="cp-msg cp-msg--bot" style={{ background: card, color: font, borderColor: border }}>
                Hi! Ask me anything.
              </div>
              <div
                className="cp-msg cp-msg--user"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})`, color: accentFg }}
              >
                What are your hours?
              </div>
            </div>
            <div className="cp-form" style={{ borderColor: border }}>
              <span className="cp-input" style={{ background: card, borderColor: border, color: muted }}>
                Type a message…
              </span>
              <span
                className="cp-send"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})`, color: accentFg }}
              >
                Send
              </span>
            </div>
          </div>
          <div className="cp-hexes">
            <code>{accent}</code>
            <code>{bg}</code>
            <code>{font}</code>
          </div>
        </div>
      </div>
    </section>
  );
}
