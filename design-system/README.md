# Common Room design system

Common Room helps roommates split shared costs and chores without the awkwardness. It should feel like a well-kept house notebook: warm paper, confident serif headlines, and numbers you can trust at a glance.

## Voice

- Speak to one roommate as “you”; name the others by first name (“Maya owes you $18.40”). Never “users” or “members”.
- Sentence case everywhere, including buttons (“Settle up”, “Add a chore”). No emoji in UI copy.
- Be fair and neutral about money — state facts, never scold (“Rent is due Friday”, not “You’re late!”).

## Color

- Build every screen on `paper`; raise cards and rows on `surface` with a 1px `rule` border — no drop shadows.
- Set text in `ink`; secondary text in `ink-muted`.
- `brand` (terracotta) is for primary actions and money you owe; `accent` (olive) is for chores, settled states and money owed to you. Always pair them with a word — never let color alone say who owes whom. Text on either is `on-color`.
- `highlight` (mustard) marks due-soon and today; text on it is `ink`.
- Focus: a 2px solid `focus` ring, 2px offset.

## Type

- Headlines in the Display group (`display`, `title`, `heading`, Fraunces). Use `display` once per screen at most.
- Running text and controls in `body` and `label` (Instrument Sans).
- Every dollar amount, date and split ratio in `amount` or `caption` (JetBrains Mono) with tabular figures, right-aligned in lists. `caption` is uppercase with .08em tracking.

## Space and shape

- Spacing steps: `space-1`, `space-2`, `space-4`, `space-8`. Pad cards and rows with `space-4`; separate sections with `space-8`.
- `radius-md` for cards and buttons, `radius-sm` for inputs, `radius-pill` for roommate chips and status tags.

## Iconography

No icon set or logo yet — set the name in `title` type until one exists. When icons are added, use 1.5px-stroke line icons in `ink`.

## Files

- `tokens.css` — CSS variables (`var(--brand)`, `var(--space-4)`…), Google Fonts import, and `.text-display` … `.text-caption` type classes. Import it once at your app root.
- `tokens.ts` — the same values as a typed object for JS/TS (styled-components, inline styles, charts).
- `tailwind.preset.js` — Tailwind preset: `bg-paper`, `text-ink`, `bg-brand`, `font-display`, `text-amount`, `p-4`, `rounded-md`… (needs `tokens.css` loaded for the color variables).
- `tokens.json` — the source of truth, in the design system's own format.
- `cover.html` — the brand cover, for reference.
