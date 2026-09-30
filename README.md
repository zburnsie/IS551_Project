# Common Room

Common Room helps roommates split shared costs and chores without the awkwardness. IS 551 group project.

## Getting started

You need [Node.js](https://nodejs.org/) 20 or newer (`node -v` to check).

```bash
git clone https://github.com/zburnsie/IS551_Project.git
cd IS551_Project
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Stack

- [React](https://react.dev/) 19 + TypeScript, built with [Vite](https://vite.dev/)
- [Tailwind CSS](https://v3.tailwindcss.com/) 3, configured by our design system's preset
- [React Router](https://reactrouter.com/) for pages

## What's here so far

Three working pages running on placeholder data:

- **Balances** (`/`): what each roommate owes you or you owe them, with a "Settle up" button, plus your chores due soon.
- **Expenses** (`/expenses`): add an expense and split it evenly between any roommates, and see the history.
- **Chores** (`/chores`): add chores, assign them, and check them off.

There's no backend yet. Data lives in React state and is saved to your browser's localStorage, so each person sees their own copy. To reset it, clear localStorage for the site or call `resetDemoData()` from `useHousehold()`.

## Project layout

```
design-system/        Common Room design system (tokens, Tailwind preset, guidelines)
src/
  main.tsx            App entry: loads tokens.css, router, and the data provider
  App.tsx             Routes
  components/         Shared UI: Layout, Button, Card/Section, Tag, form fields
  pages/              One file per page
  data/
    types.ts          Household, Roommate, Expense, Payment, Chore types
    seed.ts           Placeholder data
    household.tsx     HouseholdProvider + useHousehold() hook (the temporary data store)
  lib/
    balances.ts       Who-owes-whom math (amounts are in cents)
    format.ts         Money and date formatting
```

Components only read and write data through `useHousehold()`. When we add a backend, we should only need to change `src/data/household.tsx`.

## Design system

Read [`design-system/README.md`](design-system/README.md) before building UI. The short version:

- **Colors:** `bg-paper` for pages; `bg-surface border border-rule` for cards (no shadows). `brand` (terracotta) is for primary actions and money you owe; `accent` (olive) is for chores, settled states and money owed to you. Always pair a color with words.
- **Type:** `text-display` / `text-title` / `text-heading` for headlines, `text-body` / `text-label` for text, `text-amount` / `text-caption` for money, dates and ratios.
- **Spacing:** use only `1`, `2`, `4`, `8` (for example `p-4`, `gap-2`, `gap-8`).
- **Shape:** `rounded-md` for cards and buttons, `rounded-sm` for inputs, `rounded-pill` for chips and tags.
- **Voice:** talk to "you", name other roommates, use sentence case, no emoji, and never scold about money.

Use the existing components (`Button`, `Card`, `Section`, `Tag`, `Field`) where you can so everything stays consistent.

## Working together

1. Pull the latest `main`: `git pull`
2. Make a branch: `git checkout -b your-name/short-description`
3. Commit, push, and open a pull request on GitHub.
4. Make sure `npm run build` and `npm run lint` pass before asking for a review.

## Ideas for next steps

- Choose and add a backend (for example Firebase or Supabase) so the household is shared
- Sign in, and inviting roommates to a household
- Uneven splits (by percentage or exact amounts)
- Recurring expenses like rent and utilities
- Chore rotation
