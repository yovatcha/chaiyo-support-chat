// Colour maths mirrored from public/yo-bot.js, so previews in the dashboard
// and on the landing page render exactly like the real widget.

export function hexToRgb(h) {
  const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
  if (!m) return null;
  const i = parseInt(m[1], 16);
  return { r: (i >> 16) & 255, g: (i >> 8) & 255, b: i & 255 };
}
export function luminance(hex) {
  const c = hexToRgb(hex);
  return c ? (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255 : 0;
}
// Mirror of the widget's contrast logic so the user bubble reads the same.
export function readableOn(hex) {
  return luminance(hex) > 0.6 ? '#1a1b1e' : '#ffffff';
}
export function lighten(hex, amt) {
  const c = hexToRgb(hex);
  if (!c) return hex;
  const comp = (x) => Math.round(x).toString(16).padStart(2, '0');
  return '#' + comp(c.r + (255 - c.r) * amt) + comp(c.g + (255 - c.g) * amt) + comp(c.b + (255 - c.b) * amt);
}
export function rgba(hex, a) {
  const c = hexToRgb(hex);
  return c ? `rgba(${c.r},${c.g},${c.b},${a})` : hex;
}

// Every tone the widget derives from the three owner-picked colours.
export function widgetTheme(accent, bg, font) {
  const light = luminance(bg) > 0.6;
  return {
    accent,
    accent2: lighten(accent, 0.18),
    accentFg: readableOn(accent),
    bg,
    font,
    muted: rgba(font, 0.6),
    card: light ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
    border: light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)',
  };
}
