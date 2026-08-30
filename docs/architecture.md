# architecture.md

## 1. Recommended Tech Stack

| Layer | Choice | Why | Alternative considered |
|---|---|---|---|
| Frontend framework | **Next.js 15, App Router, TypeScript** | Server Components reduce client JS for a mostly-read-heavy app (dashboards, statements); built-in routing/middleware fits the locale + auth-protection needs directly | Plain Vite + React — rejected because you'd hand-roll routing, SSR, and metadata handling that Next.js gives for free |
| Styling | **Tailwind CSS** | Matches your existing stack; pairs directly with shadcn/ui | — |
| UI components | **shadcn/ui** (Radix UI primitives + Tailwind) | Code is copied into your project, not an opaque npm dependency — you can change anything; accessible by default (important — Radix handles focus trapping, keyboard nav, ARIA correctly, which is easy to get wrong by hand); free, MIT-licensed | Chakra UI, MUI — rejected because both impose their own styling system on top of/instead of Tailwind, fighting your existing stack |
| Icons | **lucide-react** | Ships as shadcn/ui's default icon set; consistent stroke style; free | — |
| Server state (data fetching/caching) | **TanStack Query** | Handles loading/error/retry/cache invalidation for API calls — exactly the kind of boilerplate you don't want to hand-write for a financial app where "did this deposit actually save?" needs to be unambiguous | Plain `fetch` + `useEffect` — rejected, it's what most Next.js API-integration bugs come from |
| Client-only UI state | **React Context / `useState`**, with **Zustand** only if a genuinely global piece of state emerges (e.g. active locale, sidebar collapsed) | Don't reach for a state library before you need one | Redux — rejected, too much ceremony for this app's actual state needs |
| Forms | **React Hook Form** | Minimal re-renders, works cleanly with Zod | Formik — rejected, heavier, less actively evolved |
| Validation | **Zod** | One schema definition validates the form on the frontend AND (later) the request body on the Express backend — write the rule once | Yup — comparable, but Zod's TypeScript inference is stronger, which matters since this is a TypeScript project |
| Tables | **TanStack Table** (headless) + shadcn/ui table primitives for styling | Sorting/filtering/pagination for admin member/deposit/loan lists without hand-writing that logic | — |
| Charts | **Recharts** | Used sparingly (see `information-architecture.md`) — simple, well-documented, plays nicely with shadcn's chart wrapper | — |
| Dates | **date-fns** | Lightweight, tree-shakeable, has a Bangla locale module if needed later | Moment.js — rejected, legacy/no longer actively developed |
| i18n | **next-intl** | Purpose-built for the App Router with native Server Component support — translations rendered server-side add zero bytes to the client bundle; see `i18n.md` for full rationale | next-i18next — viable but heavier (pulls in three packages) and its App Router support is newer/less battle-tested as of 2026 |
| PWA | **Serwist** (`@serwist/next`) | The actively maintained successor to `next-pwa` (which is unmaintained); referenced directly in Next.js's own PWA guide; see `pwa.md` | `next-pwa` — rejected, unmaintained |
| Auth (demo phase) | **Auth.js (NextAuth v5)**, Credentials provider now, Google provider added later | Session handling, CSRF, and cookie security are handled by a maintained library instead of hand-rolled — see `authentication.md` for exactly how the pre-approval check plugs in | Fully custom JWT-in-cookie — rejected for the demo phase; more attack surface to get right yourself for no real benefit at this stage |
| Backend (Phase 14+) | **Node.js + Express + TypeScript** | Matches your stated stack and comfort level | — |
| Database (Phase 14+) | **MongoDB** | Per your specified target architecture | — |
| SMS | Local BD SMS gateway, integrated from the Express backend only (never called from the frontend) | Keeps the SMS provider's API key server-side only | — |

**All library choices above are the *recommendation* going into Phase 1 approval — per your collaboration rule, nothing here gets installed until you approve it when we reach the relevant phase.**

---

## 2. High-Level System Architecture (Target — Post Phase 15)

```
Domain (somitikhata.com)
        ↓
Next.js Frontend (App Router, Server Components where possible)
        ↓  (all data access goes through the service layer — see §4)
Node.js + Express REST API
        ↓
MongoDB
        ↓
SMS Provider (deposit/loan notifications, server-triggered only)
```

## 2a. Current Phase Architecture (Phase 1–13 — Next.js only)

```
Next.js Frontend
        ↓
Service Layer (services/*.ts — same interface as the real API will have)
        ↓
Mock Data Layer (lib/mock-data/*.ts — in-memory, simulates network latency)
```

The UI, hooks, and pages never talk to the mock data layer directly — only through the service layer. This is the single decision that makes the later Express integration a swap, not a rewrite (see §4).

---

## 3. Frontend Folder Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/              # indexable — landing page, about
│   │   │   └── page.tsx
│   │   ├── (auth)/                 # login, register — not indexed
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (member)/               # member-only, route-protected
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── deposits/page.tsx
│   │   │   ├── loans/page.tsx
│   │   │   ├── assets/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── (admin)/                # admin-only, route-protected
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── members/page.tsx
│   │   │   ├── deposits/page.tsx
│   │   │   ├── loans/page.tsx
│   │   │   ├── assets/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── layout.tsx
│   ├── manifest.ts                 # PWA manifest (see pwa.md)
│   └── sw.ts                       # Serwist service worker entry
├── components/
│   ├── ui/                         # shadcn/ui primitives (generated, lightly customized)
│   └── shared/                     # app-specific composed components (StatCard, CurrencyText, StatusBadge)
├── features/
│   ├── auth/          {components/, hooks/, schemas/}
│   ├── members/       {components/, hooks/, schemas/}
│   ├── deposits/      {components/, hooks/, schemas/}
│   ├── loans/         {components/, hooks/, schemas/}
│   ├── assets/        {components/, hooks/, schemas/}
│   └── reports/       {components/, hooks/}
├── services/
│   ├── api-client.ts               # single fetch wrapper; base URL + auth header injection lives here only
│   ├── deposit-service.ts          # interface + mock implementation now, real implementation later
│   ├── loan-service.ts
│   ├── member-service.ts
│   └── asset-service.ts
├── lib/
│   ├── mock-data/                  # in-memory fixtures, deleted entirely in Phase 15
│   ├── auth/                       # Auth.js config, session helpers
│   ├── i18n/                       # next-intl config
│   └── utils/                      # currency formatting, date formatting, etc.
├── messages/
│   ├── en.json
│   └── bn.json
├── middleware.ts                   # locale detection + route protection
docs/                                # this folder
public/
```

**Why feature-based, not type-based (`components/`, `hooks/`, `pages/` as flat top-level folders):** at 400–500 members the app is still small, but "loans" and "deposits" are genuinely separate domains with their own forms, validation, and business rules. Grouping by feature means Phase 9 (Loans) touches one folder, not four scattered ones — easier for a solo developer to reason about, and easier to hand off later if the team grows.

---

## 4. API-Ready Service Layer (the core of "build demo now, swap backend later")

Every service is defined as a TypeScript interface first:

```typescript
// services/deposit-service.ts
export interface DepositService {
  getMemberDeposits(memberId: string): Promise<Deposit[]>;
  getCurrentBalance(memberId: string): Promise<BalanceSummary>;
  recordDeposit(input: RecordDepositInput): Promise<Deposit>;
  correctDeposit(depositId: string, input: CorrectDepositInput): Promise<Deposit>;
}
```

**Now (Phase 3–13):** `mockDepositService` implements this interface against `lib/mock-data`, with an artificial delay (150–400ms) so loading states are actually visible and tested during the demo phase — a real network call will never be instant either.

**Later (Phase 15):** `httpDepositService` implements the *same* interface, calling `POST /api/deposits` etc. on the Express backend.

A single line decides which implementation is active:
```typescript
export const depositService: DepositService =
  process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ? mockDepositService : httpDepositService;
```

React components and hooks (via TanStack Query) only ever import `depositService` from this file — never the mock or HTTP implementation directly. This is what makes the swap a one-line, one-file change instead of a UI rewrite. TanStack Query's `useQuery`/`useMutation` calls are also unaffected either way, since they only care about the returned Promise, not what's behind it.

Types (`Deposit`, `BalanceSummary`, `RecordDepositInput`) are defined once in `features/deposits/types.ts` and shared by the mock service, the real service, the Zod validation schema, and (later, by direct copy or a shared package) the Express backend's request/response types — one shape, defined once, used everywhere.

---

## 5. Route Protection Strategy (Demo Phase)

`middleware.ts` reads the Auth.js session and:
- Redirects unauthenticated users away from `(member)` and `(admin)` route groups to `/login`.
- Redirects authenticated members away from `(admin)` routes (and vice versa) rather than showing a blank/broken page.
- Leaves `(public)` and `(auth)` route groups untouched.

In the demo phase this checks a mock session role. In Phase 14+, the same middleware checks the real session issued after the Express backend validates credentials — the middleware logic itself does not change, only what populates the session.

---

## 6. What Changes vs. Doesn't When Express + MongoDB Arrive (Phase 15)

| Changes | Does NOT change |
|---|---|
| `services/*.ts` — mock implementations replaced with HTTP implementations | Every React component |
| `lib/mock-data/` — deleted | Every hook (still calls the same service interface) |
| Auth.js Credentials provider's `authorize()` function — now calls the real `/api/auth/login` endpoint instead of checking mock data | Every Zod schema (shared with backend) |
| `middleware.ts` — session shape may gain real fields (e.g. real `memberId`) | Route structure, layouts, page components |
| `.env` — real `API_BASE_URL`, real `DATABASE_URL` (backend-side) | Design system, i18n setup, PWA setup |

This table is the single most important commitment in this document — if any Phase 3–13 code makes it hard to keep this table true, that code should be reconsidered before it's written, not after.
