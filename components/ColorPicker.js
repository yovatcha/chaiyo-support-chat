'use client';

// Controlled palette-swatch picker for a single color. Renders a row of preset
// swatches plus a "custom" native color input. It holds no state of its own —
// the parent owns `value` and `onChange` so several pickers can feed one shared
// live preview (see Appearance.js).

const HEX = /^#[0-9a-fA-F]{6}$/;

export default function ColorPicker({ value, onChange, presets = [] }) {
  const lc = (value || '').toLowerCase();
  const isPreset = presets.some((p) => p.value.toLowerCase() === lc);

  return (
    <div className="swatches">
      {presets.map((p) => (
        <button
          key={p.value}
          type="button"
          className={'swatch' + (p.value.toLowerCase() === lc ? ' active' : '')}
          style={{ background: p.value }}
          aria-label={p.name}
          aria-pressed={p.value.toLowerCase() === lc}
          title={p.name}
          onClick={() => onChange(p.value)}
        />
      ))}

      <label
        className={'swatch custom' + (!isPreset ? ' active' : '')}
        title="Custom color"
        style={!isPreset && HEX.test(value || '') ? { background: value } : undefined}
      >
        {isPreset ? '+' : ''}
        <input
          type="color"
          value={HEX.test(value || '') ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Custom color"
        />
      </label>
    </div>
  );
}
