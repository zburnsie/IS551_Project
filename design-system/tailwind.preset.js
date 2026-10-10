/** Tailwind preset for Common Room. Use: presets: [require('./tailwind.preset.js')] */
module.exports = {
  theme: {
    extend: {
      colors: {
        "paper": "var(--paper)",
        "surface": "var(--surface)",
        "rule": "var(--rule)",
        "sky": "var(--sky)",
        "ink": "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "brand": "var(--brand)",
        "accent": "var(--accent)",
        "highlight": "var(--highlight)",
        "success": "var(--success)",
        "success-ink": "var(--success-ink)",
        "success-mid": "var(--success-mid)",
        "olive": "var(--olive)",
        "olive-ink": "var(--olive-ink)",
        "olive-mid": "var(--olive-mid)",
        "danger": "var(--danger)",
        "danger-soft": "var(--danger-soft)",
        "danger-ink": "var(--danger-ink)",
        "on-color": "var(--on-color)",
        "focus": "var(--focus)"
      },
      fontFamily: { display: ["Fraunces", "Georgia", "serif"], sans: ["Instrument Sans", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "ui-monospace", "monospace"] },
      fontSize: {"display": ["56px", {"lineHeight": "60px", "fontWeight": "500"}], "title": ["32px", {"lineHeight": "38px", "fontWeight": "500"}], "heading": ["22px", {"lineHeight": "28px", "fontWeight": "600"}], "body": ["16px", {"lineHeight": "24px", "fontWeight": "400"}], "label": ["14px", {"lineHeight": "20px", "fontWeight": "600"}], "amount": ["16px", {"lineHeight": "22px", "fontWeight": "500"}], "caption": ["12px", {"lineHeight": "16px", "fontWeight": "400"}]},
      spacing: {"1": "4px", "2": "8px", "4": "16px", "8": "32px"},
      borderRadius: {"sm": "3px", "md": "8px", "pill": "999px"},
    },
  },
};
