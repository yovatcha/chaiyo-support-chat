'use client';

// Appearance section for the bot editor — the header title/description plus the
// accent, background, and font colors. Everything is held in one piece of state
// so the live preview mirrors exactly how the embed widget will look, and
// hidden inputs carry the values into the surrounding server-action <form>.

import { useState } from 'react';
import ColorPicker from '@/components/ColorPicker';
import { DEFAULTS, ACCENT_PRESETS, BG_PRESETS, FONT_PRESETS } from '@/lib/appearance-presets';
import { luminance, readableOn, lighten, rgba } from '@/lib/color';

const HEX = /^#[0-9a-fA-F]{6}$/;

export default function Appearance({ bot = {} }) {
  const [title, setTitle] = useState(bot.title || '');
  const [description, setDescription] = useState(bot.description || '');
  const [greeting, setGreeting] = useState(bot.greeting || '');
  const [placeholder, setPlaceholder] = useState(bot.placeholder || '');
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
  const greetingText = greeting.trim() || `Hi! I'm ${bot.bot_name || 'your assistant'} 🤖 How can I help?`;
  const placeholderText = placeholder.trim() || 'Type a message…';

  return (
    <section className="appearance form-sec frame">
      <div className="form-sec-head"><span className="mono-idx">04</span><h2>Appearance</h2></div>
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

          <label>
            Opening message — the first thing the bot says
            <textarea
              name="greeting"
              rows={3}
              maxLength={500}
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder={`Hi! I'm ${bot.bot_name || 'your assistant'} 🤖 How can I help?`}
            />
          </label>

          <label>
            Input placeholder — the greyed hint in the message box
            <input
              name="placeholder"
              maxLength={80}
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Type a message…"
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
                {greetingText}
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
                {placeholderText}
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
