# pwa.md

## 1. Library: Serwist

**Recommended: Serwist (`@serwist/next`)** — the actively maintained successor to `next-pwa`, which is unmaintained. Serwist is referenced directly in Next.js's own official PWA guide as of 2026, provides a typed `sw.ts` service worker entry point that integrates cleanly with the App Router, and handles the build-time work (precache manifest injection, `public/sw.js` generation) that would otherwise be hand-rolled.

## 2. Core Pieces

- `app/manifest.ts` — Next.js's native manifest route, defining name, short_name, icons, theme color, and `display: 'standalone'`.
- `app/sw.ts` — the Serwist-powered service worker: precaches the app shell (layout, core CSS/JS), and defines runtime caching rules for everything else.
- Icons: a full set (192×192, 512×512, plus maskable variants for Android's adaptive icon system) generated once the visual identity in `design.md` is finalized — placeholder icons in the demo phase, real ones before Phase 13 closes.
- Theme color: `--color-primary` from `design.md` (`#0F6B4F`), applied to both the manifest and the mobile browser chrome color via `<meta name="theme-color">`.

## 3. Offline Strategy — What's Safe vs. Not

This is a financial app, so "make everything work offline" is the wrong goal — the right goal is that the app *feels* fast and native, while never letting anyone act on stale or unsynced financial data.

| Safe to work offline | Requires an online connection |
|---|---|
| App shell (navigation, layout, static UI chrome) | Login |
| Public landing page | Deposit entry/correction (admin) |
| Previously-viewed dashboard data, shown with a clear "last updated [time]" indicator | Loan application submission |
| Basic navigation between already-visited pages | Loan repayment recording |
| | Any balance/share calculation (always fetched live, never computed client-side from cached data, to avoid a member seeing a stale total presented as current) |
| | Admin actions of any kind |

**Explicitly rejected approach:** offline-first read/write with background sync (queuing an admin's deposit entry to sync "later" when back online). This is a common PWA pattern, but wrong here — a queued-but-unsynced deposit entry sitting on one admin's phone is exactly the kind of silent-drift risk `business-rules.md` is designed to prevent. If connectivity is unavailable, the correct UX is a clear "you're offline, this action requires a connection" message, not a queue that might be forgotten, duplicated, or lost.

## 4. Cache Invalidation / Update Strategy

- Static assets (JS/CSS bundles): precached with a content hash in the filename (Next.js's default build behavior) — a new deploy automatically invalidates old cached assets.
- API/data responses: **not** cached by the service worker at all — TanStack Query (already in the stack per `architecture.md`) handles data caching/staleness in memory, which is the appropriate layer for data that must reflect real financial state; the service worker's job stays limited to the app shell and static assets.
- Update prompt: when a new service worker version is available, show a small non-intrusive "Update available — refresh to get the latest version" toast, rather than force-reloading a user mid-task (`skipWaiting` without a user-facing prompt is convenient for developers but can interrupt someone mid-form-submission).

## 5. Install Prompt

Android supports the native "Add to Home Screen" prompt out of the box once the manifest and service worker requirements are met (HTTPS, valid manifest, registered service worker). No custom install-prompt library is needed for this — a simple in-app banner (dismissible, not shown again for 14 days if dismissed) can surface the browser's native `beforeinstallprompt` event, but this is a small enhancement, not core PWA infrastructure, and can be deferred within Phase 13 if time is tight.

iOS/Safari has more limited PWA support (no `beforeinstallprompt`, install is manual via the Share menu) — the landing/onboarding content should include a one-time, dismissible instruction for iOS users on how to add to home screen manually, since iOS won't prompt for them.

## 6. Performance Goals (Mobile, Bangladesh Network Conditions)

- Design for 3G/slower-4G conditions realistically found outside major BD cities, not just fast urban wifi.
- Server Components by default (per `architecture.md`); a component is only made a Client Component when it genuinely needs interactivity (forms, the one chart, the deposit-entry grid) — this directly minimizes shipped JavaScript, which matters more on a slow connection than almost any other optimization.
- Images: Next.js `<Image>` component throughout (automatic sizing/format optimization) — the app has few images to begin with (mostly icons and the landing page), so this is a small but free win.
- Fonts: `next/font` for both Inter and Hind Siliguri, which self-hosts and subsets the fonts at build time — avoids a render-blocking external font request per page load.
- Target: first meaningful content visible in under 3 seconds on a simulated slow-4G connection (Lighthouse mobile throttling profile) — measured and tuned as part of Phase 13, not assumed.
