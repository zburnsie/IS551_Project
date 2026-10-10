export const tokens = {
  "color": {
    "paper": "#F7F5F1",
    "surface": "#FFFFFF",
    "rule": "#E0DCD1",
    "sky": "#D5E3E8",
    "highlight": "#E4E3BC",
    "ink": "#344945",
    "ink-muted": "#5C6B67",
    "accent": "#344945",
    "brand": "#D5E3E8",
    "success": "#DCE8D6",
    "success-ink": "#2A4A32",
    "success-mid": "#BCCCB8",
    "positive": "#2E7D4F",
    "olive": "#EBE4C8",
    "olive-ink": "#4A4520",
    "olive-mid": "#CEC7AA",
    "danger": "#C23B2E",
    "danger-soft": "#F8E0DC",
    "danger-ink": "#9B2F24",
    "on-color": "#F7F5F1",
    "focus": "#344945"
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
