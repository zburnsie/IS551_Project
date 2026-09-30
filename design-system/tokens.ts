export const tokens = {
  "color": {
    "paper": "#F7F1E8",
    "surface": "#FFFBF5",
    "rule": "#E3D7C6",
    "ink": "#2A211B",
    "ink-muted": "#6B5B4E",
    "brand": "#B5532F",
    "accent": "#4F6B3A",
    "highlight": "#E6B84A",
    "on-color": "#FFFBF5",
    "focus": "#2A211B"
  },
  "font": {
    "display": "\"Fraunces\", Georgia, serif",
    "sans": "\"Instrument Sans\", system-ui, sans-serif",
    "mono": "\"JetBrains Mono\", ui-monospace, monospace"
  },
  "text": {
    "display": {
      "family": "display",
      "fontSize": "56px",
      "lineHeight": "60px",
      "fontWeight": 500
    },
    "title": {
      "family": "display",
      "fontSize": "32px",
      "lineHeight": "38px",
      "fontWeight": 500
    },
    "heading": {
      "family": "display",
      "fontSize": "22px",
      "lineHeight": "28px",
      "fontWeight": 600
    },
    "body": {
      "family": "sans",
      "fontSize": "16px",
      "lineHeight": "24px",
      "fontWeight": 400
    },
    "label": {
      "family": "sans",
      "fontSize": "14px",
      "lineHeight": "20px",
      "fontWeight": 600
    },
    "amount": {
      "family": "mono",
      "fontSize": "16px",
      "lineHeight": "22px",
      "fontWeight": 500
    },
    "caption": {
      "family": "mono",
      "fontSize": "12px",
      "lineHeight": "16px",
      "fontWeight": 400
    }
  },
  "space": {
    "space-1": "4px",
    "space-2": "8px",
    "space-4": "16px",
    "space-8": "32px"
  },
  "radius": {
    "radius-sm": "3px",
    "radius-md": "8px",
    "radius-pill": "999px"
  }
} as const;

export type Tokens = typeof tokens;
