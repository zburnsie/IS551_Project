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

A clickable low-fidelity prototype of the roommate happy path: onboarding, shared chores, and money/IOUs. There's no backend yet; everything lives in your browser's localStorage.

**Prototype bar.** The dark bar at the bottom of every screen is not part of the app. Use it to:

- **Load demo room**: jump into "Dorm 204" as Alex, with chores, IOUs and activity already filled in.
- **Acting as**: switch to another roommate, so you can confirm an IOU or mark it paid from both sides.
- **Reset**: clear everything and start from the homepage.

Sign-in is simulated: passwords aren't checked or saved, and "Continue with your school account" just asks for a `.edu` email.

### Screens

| # | Screen | Route |
| --- | --- | --- |
| | **Before login** | |
| 1 | Homepage | `/` |
| 2 | Sign up (email or school login) | `/signup` |
| 3 | Log in | `/login` |
| | **1. Onboarding** | |
| 4 | Create profile (name, photo, dorm) | `/welcome/profile` |
| 5 | Create or join a room | `/welcome/room` |
| 6 | Create room group | `/welcome/room/new` |
| 7 | Join with a code (invite links `/join/CODE` land here) | `/welcome/join` |
| 8 | Invite roommates (link / code) | `/welcome/invite`, `/room/invite` |
| | **Room** | |
| 9 | Room home: your chores, balance, IOUs to confirm, activity | `/room` |
| | **2. Shared chores** | |
| 10 | Areas (kitchen, a shared bathroom…) and who shares each | `/chores` |
| 11 | House overview: progress, chores done per roommate, what's still to do and whose turn | `/chores/overview` |
| 12 | Create area (everyone, or just some roommates) | `/chores/lists/new` |
| 13 | Area: to do and done | `/chores/lists/:listId` |
| 14 | Edit area: rename, change who shares it, delete | `/chores/lists/:listId/edit` |
| 15 | Add chore (due date, repeat) | `/chores/lists/:listId/add` |
| 16 | Assign roommate and rotation, from the area's roommates (assignee is notified) | `/chores/:choreId/assign` |
| 17 | Chore detail: mark complete, rotation, done so far | `/chores/:choreId` |
| 18 | Chore done: room sees it, next person in rotation | `/chores/:choreId/done` |
| | **3. Money and IOUs** | |
| 19 | Balances: who owes whom | `/money` |
| 20 | Log an IOU ($ or "a dinner") | `/money/new` |
| 21 | IOU detail: roommate confirms, declines, or suggests a different amount | `/money/ious/:iouId` |
| 22 | Settle up: both mark as paid | `/money/settle/:userId` |
| | **Other** | |
| 23 | Inbox (notifications) | `/inbox` |
| 24 | Profile and room settings | `/settings` |

**How areas work:** chores are grouped into areas, like the kitchen or a bathroom. An area is shared by everyone in the room (including roommates who join later) or just the roommates you pick, and only they are offered when assigning its chores or setting up a rotation. In the code an area is a `ChoreList` with `memberIds` (empty means everyone).

**How tracking works:** every time a chore is marked complete it's saved as a `ChoreCompletion`: who did it, whose turn it was, and whether it was on time. The house overview, each area's "Done" list and each chore's "Done so far" are built from these. History starts when this was added; older completions weren't recorded.

**How rotation works:** a repeating chore has a rotation (who takes turns, in room order). Marking it complete moves the due date forward and hands it to the next person, who gets notified. One-off chores just stay done.

**How IOUs work:** whoever logs an IOU sends it to the other roommate to confirm; it only counts toward balances once confirmed. Instead of confirming, they can decline it or suggest a different amount (or a different favor), which goes back to the first roommate to confirm. This can go back and forth until one of them confirms or declines. To settle up, each of you marks it paid; it clears once both have.

## Project layout

```
design-system/        Common Room design system (tokens, Tailwind preset, guidelines)
src/
  main.tsx            App entry: loads tokens.css, router, and the data provider
  App.tsx             Routes, grouped by the happy-path sections
  components/         Shared UI: layouts, route guards, Button, Card, Tag, fields, Avatar, PrototypeBar
  pages/
    public/           Homepage, sign up, log in, invite links
    onboarding/       Profile, create/join room, invite
    room/             Room home, settings
    chores/           Lists, add, assign, detail, done
    money/            Balances, log IOU, IOU detail, settle up, inbox
  data/
    types.ts          User, Room, ChoreList (area), Chore, ChoreCompletion, Iou, Activity types
    seed.ts           Empty state and the demo room
    store.tsx         AppProvider + useApp() hook (the temporary data store)
  lib/
    balances.ts       Who-owes-whom math (amounts are in cents)
    chores.ts         Repeat labels, next due date, rotation, area members, lateness
    activity.ts       Feed and inbox sentences
    format.ts         Money, date and name formatting
```

Pages only read and write data through `useApp()`. When we add a backend, we should only need to change `src/data/store.tsx`.

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
- Real sign-in and invites
- Uneven splits (by percentage or exact amounts)
- Recurring expenses like rent and utilities
- Reordering a chore rotation by drag and drop
