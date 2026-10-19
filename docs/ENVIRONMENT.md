# Environment Variables

The web app reads only **public** variables (`NEXT_PUBLIC_*`). Next.js inlines them into the
browser bundle at build time, so they are visible to anyone: **never put a secret in one.** All
secrets (JWT, database, Cloudinary) belong to the backend.

Template: [`.env.example`](../.env.example). Locally copy it to `.env.local` (git-ignored).

## Variables

| Variable | Required | Example | Read by | Purpose |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | **yes** | `http://localhost:5000/api/v1` | `src/lib/env.ts` → `httpKit` | Base URL of the SomitiKhata API, **including `/api/v1`** |
| `NEXT_PUBLIC_SITE_URL` | recommended in production | `https://somitikhata.vercel.app` | `src/lib/metadata.ts` (`getSiteUrl`) | Absolute base for canonical links, `hreflang`, sitemap, `robots.txt` and share cards |

Also read, set by the host (do not set by hand):

| Variable | Read by | Purpose |
|---|---|---|
| `VERCEL_PROJECT_PRODUCTION_URL` | `getSiteUrl()` | Fallback site URL on Vercel when `NEXT_PUBLIC_SITE_URL` is not set |
| `NODE_ENV` | Next.js | `development` / `production` |

## Validation

`getPublicEnv()` parses `NEXT_PUBLIC_API_BASE_URL` with Zod (`z.url()`). When it is missing or
not a URL, the first module that creates `httpKit` throws, and the app shows the error page. Fix
the value and restart `npm run dev` (or rebuild: values are fixed at build time).

`getSiteUrl()` falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`.

## Per environment

| | Local | Production |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000/api/v1` | the deployed API + `/api/v1` (the backend repository lists `https://apibottolisomobai.vercel.app`; **needs confirmation**) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | the canonical public origin. The live deployment's pages currently declare `https://somitikhata.com` as canonical, so it is set to that; whether that domain serves the app **needs confirmation** |

The backend must allow this app's origin: its `FRONTEND_URL` must list the exact origin
(scheme, host and port). In production set the variables in the Vercel project's
**Settings → Environment Variables** and redeploy (they are built in).

## Adding a variable

1. Public values only. If it is a secret, it belongs to the backend.
2. Name it `NEXT_PUBLIC_…`, add it to the Zod schema in `src/lib/env.ts` (read it by its **full
   name**: `process.env.NEXT_PUBLIC_X`, so Next.js can inline it).
3. Add it to `.env.example` with a comment, and to this page.
4. Set it in every deployment before deploying the code that needs it.
