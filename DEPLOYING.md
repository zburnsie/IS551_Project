# Deploying Common Room

We are not deploying yet. This is the plan for when we want a public link people can try.

The app is a static site (no backend), so any static host works. We'd use [Vercel](https://vercel.com): it's free, detects Vite on its own, and gives every branch its own preview link.

## Before you start

**Add `vercel.json` to the repo root.** Every screen has its own URL (`/room`, `/join/KTX-482`…). Without this file, refreshing a page or opening an invite link gives a 404 on Vercel.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Commit and push it. It only takes effect on Vercel, so refresh a page like `/room` after the first deploy to check it works.

## Option A: connect the GitHub repo (best for the group)

Every push deploys automatically, and each branch gets a preview link.

This has to be done by **the repo owner (zburnsie)**. Connecting a repo means installing Vercel's GitHub app on the owner's account; push/merge access isn't enough, and the repo won't show up in the import list for collaborators.

1. Go to vercel.com and sign in with GitHub.
2. Import `zburnsie/IS551_Project`. Keep the default settings (framework: Vite, build: `npm run build`, output: `dist`).
3. Vercel deploys `main` as the production site. Other branches show up as previews in the project's **Deployments** tab. To make a different branch the main site, change the production branch in **Settings**.
4. After a collaborator's first push, check that it produced a deployment. On the free plan, commits from collaborators may not deploy if the repo is private.

## Option B: deploy from your own computer (no repo permissions needed)

Uploads the project folder straight to your own Vercel account.

```bash
npx vercel
```

It opens a browser to sign in, asks a few setup questions (defaults are fine), and prints a link. To update the link with newer changes:

```bash
npx vercel --prod
```

It does not update on its own when you push; re-run the command.

## Option C: fork and import

Fork the repo to your own GitHub account and import the fork on Vercel (as in Option A). You own the fork, so Vercel can connect to it. You'll need to keep the fork in sync with the team repo.

## What to tell testers

- Data is saved in each person's own browser. Two people can't share a room yet; everyone gets their own copy.
- Click **Try the demo room** on the homepage, then use **Acting as** in the dark bar at the bottom to see both sides of an IOU or a chore rotation.

Shared rooms would need a real backend (for example Supabase or Firebase). Only `src/data/store.tsx` should need to change.

## Taking it down

All of this happens on vercel.com, in the account that owns the project. Nothing in the repo changes.

- **Whole site:** Settings → scroll to the bottom → Delete Project. Every link stops working. Re-import later to bring it back.
- **One link:** Deployments tab → "…" next to a deployment → Delete.
- **Stop updates but keep the site up:** Settings → Git → disconnect the repo.

The free Hobby plan doesn't charge, so there's no bill to stop.
