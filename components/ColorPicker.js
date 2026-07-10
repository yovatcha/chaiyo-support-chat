'use client';

// Palette-swatch picker for a bot's chat accent color. Renders a hidden input
// (name="accent_color") that the surrounding server-action <form> submits.
// The live preview mirrors how the color reads in the embed widget.

import { useState } from 'react';

const PRESETS = [
  { name: 'Slate', value: '#5e85a4' },
  { name: 'Red', value: '#cc2b22' },
  { name: 'Gold', value: '#e1b341' },
  { name: 'Green', value: '#2f9e6b' },
  { name: 'Violet', value: '#7c5cff' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Ink', value: '#1a1b1e' },
];

const DEFAULT = '#5e85a4';
const HEX = /^#[0-9a-fA-F]{6}$/;

// Mirror of the widget's contrast logic so the preview text matches the bubble.
function readableOn(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#ffffff';
  const i = parseInt(m[1], 16);
  const L = (0.299 * ((i >> 16) & 255) + 0.587 * ((i >> 8) & 255) + 0.114 * (i & 255)) / 255;
  return L > 0.6 ? '#1a1b1e' : '#ffffff';
}

export default function ColorPicker({ name = 'accent_color', defaultValue }) {
  const [color, setColor] = useState(HEX.test(defaultValue || '') ? defaultValue : DEFAULT);
  const lc = color.toLowerCase();
  const isPreset = PRESETS.some((p) => p.value.toLowerCase() === lc);

  return (
    <div className="colorpicker">
      <input type="hidden" name={name} value={color} />

      <div className="swatches">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            className={'swatch' + (p.value.toLowerCase() === lc ? ' active' : '')}
            style={{ background: p.value }}
            aria-label={p.name}
            aria-pressed={p.value.toLowerCase() === lc}
            title={p.name}
            onClick={() => setColor(p.value)}
          />
        ))}

        <label
          className={'swatch custom' + (!isPreset ? ' active' : '')}
          title="Custom color"
          style={!isPreset ? { background: color } : undefined}
        >
          {isPreset ? '+' : ''}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Custom color"
          />
        </label>
      </div>

      <span className="cp-preview">
        <span className="cp-bubble" style={{ background: color, color: readableOn(color) }}>
          ●
        </span>
        <code>{color}</code>
      </span>
    </div>
  );
}
