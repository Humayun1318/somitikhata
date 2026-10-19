# Development Guide

How to work on the web app: coding conventions, the rules each feature follows, step-by-step
recipes, deployment and troubleshooting. It replaces the former `docs/engineering-guide.md`;
its still-valid "Current Working Rules" (section 0) and the JSX and file-naming rules live here
now, and the outdated scaffold-era sections were dropped.

Read [ARCHITECTURE.md](ARCHITECTURE.md), [DESIGN.md](DESIGN.md) and [API.md](API.md) first.

## Contents

- [Setup](#setup)
- [Coding conventions](#coding-conventions)
- [Feature rules](#feature-rules)
- [Recipes](#recipes)
- [Quality checks](#quality-checks)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Setup

See [Getting started](../README.md#getting-started). You need the backend running (or a
reachable deployment) and `NEXT_PUBLIC_API_BASE_URL` pointing at it. The backend's
`FRONTEND_URL` must include `http://localhost:3000`.

## Coding conventions

### Keep it simple

- Simple and readable beats clever; another developer must understand a file in one read.
- Before creating something, look for an existing component, hook or helper
  ([UTILITIES.md](UTILITIES.md)).
- Do not build a generic system for one use; extract a shared piece when a **second real use**
  exists.
- Small, focused components; split a component that grows past one job (a list page = toolbar +
  table + pagination).
- Read a file and understand its job before changing it; do not rewrite working code to match a
  preferred style.
- No new package without a named, concrete need, and ask first.

### JSX rule

Logic before `return`; the `return` holds only JSX. Before `return` a component may contain
constants, hooks, calculations, derived values, transformations, helper functions and
configuration, but **no detached JSX**.

```tsx
export function Example() {
  const t = useTranslations("Example");
  const items = getItems();

  return (
    <section>
      <h1>{t("title")}</h1>
      <ul>{items.map((item) => <li key={item.id}>{item.label}</li>)}</ul>
    </section>
  );
}
```

### Naming

| Thing | Convention | Example |
|---|---|---|
| Files and folders | kebab-case | `member-form-dialog.tsx`, `use-member-list-params.ts` |
| Components | PascalCase | `MemberFormDialog` |
| Hooks | `use…` camelCase, one per file in `hooks/` | `useMembers` |
| Functions, variables | camelCase | `formatPaisa`, `getPublicEnv` |
| Constants | UPPER_SNAKE | `PAGE_SIZE_OPTIONS`, `TAKA_INPUT_PATTERN` |
| API objects | `<thing>Api` | `memberApi` |
| Query key factories | `<thing>Keys` | `memberKeys` |
| Routes | domain nouns, kebab-case | `/admin/collections/cash-book` |
| Message namespaces | PascalCase | `Members`, `ApiLoading` |

### Client and server components

- Pages and layouts are Server Components by default. Add `"use client"` only to components that
  need state, effects, event handlers, browser APIs or TanStack Query.
- Signed-in pages render a client feature component; data loads in the browser.
- Pages that read search params wrap their client component in `<Suspense>`.

### TypeScript and lint

- `strict` TypeScript; the `@/*` alias points to `src/*`.
- ESLint: `eslint-config-next` (core web vitals + TypeScript). Fix warnings; do not disable rules.

## Feature rules

The rules each part of the app follows today. Keep new work consistent with them.

### API calls and loading

- Every request goes through `httpKit`; each feature has one `api.ts`; reads are `useQuery`,
  writes are `useMutation`, in the feature's `hooks/`; keys in `query-keys.ts`
  ([API.md](API.md)).
- Only send query parameters the backend supports (check its `*.builder.config.ts` or Zod query
  schema). Never invent them.
- Reads show loading inside the page (skeleton on first load, an "updating" hint while the next
  page loads); no toast.
- Mutations: automatic loading toast (`meta.loadingMessage`), button spinner, no duplicate
  submits (`useSubmitLock`), dialogs not dismissible while busy, errors in the form
  ([ERROR_HANDLING.md](ERROR_HANDLING.md)).
- After a mutation, invalidate every key that shows the changed data (`invalidateMemberViews`,
  `invalidateSummaries`, the feature's refresh helper).
- A dialog that keeps a row snapshot shows the list's current row with the same `_id` when there
  is one (members page).

### List pages (pattern of the members list)

- Query state (page, limit, search, filters, sort) in the **URL**; one `useQuery`; the backend's
  `meta` drives `Pagination`; no client-side paging or filtering.
- Changing search, filters or sort resets to page 1.
- Search text is sent as typed (the backend escapes it).
- Tables are built from a typed `columns` array.
- Reuse `SearchInput`, `SortableHeader`, `Pagination`, `ListLoading` / `ListEmpty` / `ListError`.

### Day-only dates

- The backend stores join date, date of birth, exit date and transaction dates as midnight in
  Dhaka (older rows: UTC midnight). Show them with `timeZone: DHAKA_TIME_ZONE`, never UTC.
- Date inputs use `toDhakaDateString()` for today and prefills.
- Range filters send whole Dhaka days with `dhakaDayStart()` / `dhakaDayEnd()`.

### Money

- The API stores and returns **paisa** and accepts **taka** in bodies. Amount range filters
  (`minAmount`/`maxAmount`) are compared with stored values, so they are sent in paisa
  (`takaToPaisa()`).
- Show money only with `<Money>` / `formatPaisa()`. Never divide by 100 in a component.
- Taka inputs: text inputs with `inputMode="decimal"`, checked with `TAKA_INPUT_PATTERN`; send
  `Number(value)`.
- Balances and limits come from the API. A page may add up the rows it shows (labelled "total on
  this page"), never recompute a balance or a limit.
- A wrong entry is never edited; it is reversed.

### System profile vs member profile

- **System profile** (`/admin/profile`, `/member/profile`, `features/profile`): the login account
  from `GET /user/me` (name, phone, email, role, status, password, own photo for staff).
- **Member profile** (`/member/membership`, `features/membership`): the society's record from
  `GET /member/me` (member info, society info, business and address, documents) and the
  member's nominees (`GET /nominee/my-nominees`, read only).

### Members, addresses and nominees

- Business fields (`businessName`, `marketOrRoad`, `businessType`) are required. Two addresses
  share the backend's shape (`types/address.ts`): present address needs upazila + district;
  permanent is optional.
- Addresses are edited with `AddressFields` and checked with `addressSchema()`;
  `toAddressPayload()` sends only filled parts; on edit a changed address is sent whole and an
  emptied one as `{}`.
- Every member has 1–2 nominees. The first is part of **Add member** (same request, one
  transaction); later ones are managed in **Member details** (add / edit / delete dialogs on top
  of it). The UI hides or disables adding a third and deleting the last (the backend refuses them
  too).
- `NomineeFormFields` is one set of fields for both forms (values under `nominee`). Relation
  "other" needs a note; ID type and number go together; a nominee under 18 needs a guardian
  (`isMinorDob`, Dhaka date), the same rules as the backend.
- The update APIs cannot empty a saved optional value (no "unset"). Forms detect such fields first
  (`findClearedFields`, `findClearedNomineeFields`) and show "can't be emptied" instead of sending.

### Login accounts: status and password reset

- `features/users`: `PATCH /user/update-status/:id` (active / inactive / suspended) and
  `PATCH /user/reset-password/:id` (no body). An admin may act on members only; the super admin
  on members and admins; nobody on their own account.
- Admins list: the Actions column is shown to the super admin only.
- Members: account status follows the member status, so the only member account action is
  **Reset password** (Member details → Login account; the account is found with
  `GET /user?member=<Member _id>&role=member`).
- Reset never shows or sends a password: it sets it back to the registered mobile number and
  forces a change. The dialog needs "I checked who is asking" ticked.
- All login-account queries live under `userKeys.all` (`["users"]`).

### Samiti accounts: settings, heads, entries, openings, loans

- **Settings** (`/admin/settings`): `GET /settings` returns
  `{ key, value, effectiveFrom, changedAt, upcoming }` per key; values are strings (percent `"95"`,
  money in paisa `"192800"`, the lock as an ISO date). `setting-keys.ts` groups the keys and
  their formats; `setting-values.ts` converts. Only the super admin edits (a new version from a
  chosen date). `fiscal_year_start_month` is read-only (the backend uses a fixed July). One key:
  `useSetting(key)`.
- **Ledger heads** (`/admin/collections/heads?kind=`): read with balances from
  `GET /transactions/head-balances` (`useHeadBalances`). Income/expense tabs show the current
  fiscal year (`?from=` = `fiscalYearStart()`), the others all-time. Kind never changes; only
  asset/liability heads have a section.
- **Samiti entries** (`/admin/collections/society?head=`): one list for income, expense, asset,
  liability, transfer rows, head openings and their reversals (`TransactionList
  variant="society"`). Dialogs: `SocietyEntryDialog` (heads follow the type's `headKinds`) and
  `TransferDialog` (two linked rows; reversing one reverses both).
- **Opening balances**: tabs Member / Cash & bank / Head; the go-live card
  (`GET /transactions/opening-summary`) shows assets vs liabilities and the difference.
- **Closed books** (`backdate_lock_until`): the backend refuses entries dated on or before it and
  reversing rows of a closed year. Details hides Reverse for those rows and for loan rows, and
  says why. Errors are mapped in `collection-errors.ts`.
- **Refunds**: Share / Stayi refunds are member withdrawals. The record dialog shows the balance
  and offers "use full balance"; Share Refund is offered only when the member has a share, and
  always for the whole share.
- **Loans** (`/admin/loans`): list with status / member / loan-number filters; details dialog with
  the schedule and the next step (approve, reject, disburse, collect next installment).
  Disburse and collect refresh the collections views.

### Year-end, reports and dashboards

- **Year-end** (`/admin/year-end?year=`): status from `GET /year-end/:fiscalYear`. Admins see it;
  only the super admin gets "Preview and run" and "Add depreciation". Each run dialog shows the
  server's own preview (`POST …/preview`, never cached) and needs a ticked confirmation. The
  dividend needs the committee's amount first. A run refreshes every query except the signed-in
  user. Why a step cannot run is worked out from the status (the backend's reason is English).
  Backend messages are mapped in `year-end-errors.ts`.
- **Reports** (`/admin/reports?report=&year=&account=`): the five report endpoints; only the
  parameters the backend's `report.validation.ts` accepts are sent (dates `YYYY-MM-DD`). A running
  year is shown up to today. Print uses the browser.
- **Dashboards** (`features/overview`): admin `GET /dashboard/overview?fiscalYear=`, member
  `GET /dashboard/my-overview`; the member passbook `GET /transactions/my-ledger` and loans
  `GET /loans/my-loans` (`features/member-area`). Members cannot read the transaction-type
  catalog, so `ledger-direction.ts` reads a row's effect from its system code.
- **Summaries go stale with every change**: `invalidateSummaries()` is called by every money,
  member, loan, head and setting mutation.
- **Not supported by the backend yet** (online deposit request, online loan application, pending
  online member applications, member settings, online sign-up): the page shows `ComingSoon` (for
  sign-up, how membership is opened at the office), never sample data or a form that cannot be
  sent.

### Rendering, metadata and SEO

- Public pages are static per locale; the signed-in area is a static shell with client data
  ([ARCHITECTURE.md](ARCHITECTURE.md#rendering-strategy)).
- Public client components may only read namespaces in `PUBLIC_CLIENT_MESSAGES`.
- `loading.tsx` only in `(dashboard)`, so a 404 returns status 404.
- Every page exports `pageTitleMetadata("<key>")` or `publicPageMetadata("<key>", "/path")`;
  titles in `common.json` → `Metadata.pages` (both locales).
- `(dashboard)` is `noindex`; `robots.txt` disallows `/admin`, `/member`, `/unauthorized`;
  the sitemap lists the public pages. Set `NEXT_PUBLIC_SITE_URL` in production.

### Home page and branding

- Home (`features/home`, `app/[locale]/(public)/page.tsx`): server sections with texts in
  `home.json`; only parts that depend on the signed-in user are client components (`HomeActions`,
  the navbar's `AccountNav`, the footer's account links and year). It describes only features that
  work and shows no figures.
- Public navbar: signed in → the dashboard's `ProfileMenu variant="public"`; guest → Sign in.
- `public/branding`: every file is generated from one master logo at the size its name says; keep
  the names (metadata and manifest use them).

## Recipes

### Add a feature

1. **Confirm the API** exists: endpoint, parameters, response (backend `docs/API.md` or Swagger).
   Do not build against an endpoint that does not exist; use a `ComingSoon` page instead.
2. Create `src/features/<name>/` with `types.ts` (API shapes), `api.ts` (`<name>Api`),
   `query-keys.ts` (`<name>Keys` with `all`), `hooks/` (queries and mutations with
   `meta.loadingMessage`), `schemas.ts` (Zod forms built with `t`), `components/`.
3. Add an error mapper (`<name>-errors.ts`) if the backend has refusals the user must understand.
4. Add translations: `messages/en/<name>.json` and `messages/bn/<name>.json` (same keys), then
   add `<name>` to `MESSAGE_FILES` in `src/i18n/messages.ts`. Loading-toast keys go in
   `common.json` → `ApiLoading`.
5. Add the route (below) and, if needed, a sidebar item.
6. Invalidate the right keys after mutations (and `invalidateSummaries` when money, members,
   loans, heads or settings change).
7. Check loading, empty, error, busy states; phone and desktop; keyboard; both languages.
8. Update the docs ([API.md](API.md#which-feature-calls-which-endpoints), this guide's feature
   rules, [UTILITIES.md](UTILITIES.md) for new shared pieces).

### Add a page

1. `src/app/[locale]/(dashboard)/<area>/<path>/page.tsx` (or `(public)` / `(auth)`):

   ```tsx
   import { ThingPage } from "@/features/thing/components/thing-page";
   import { pageTitleMetadata } from "@/lib/metadata";

   export const generateMetadata = pageTitleMetadata("thing");

   export default function AdminThingPage() {
     return <ThingPage />;
   }
   ```

2. Add `"thing"` to `PageTitleKey` (`src/lib/metadata.ts`) and `Metadata.pages.thing` to both
   `common.json` files.
3. Sidebar: add an item to `features/dashboard/config/sidebar.ts` (`id`, `titleKey`, `href`,
   `iconName`, `roles: ['ADMIN']` or `['MEMBER']`) and its title to `DashboardSidebar` messages.
4. Public page: use `publicPageMetadata` and add the path to `PUBLIC_PATHS` in `sitemap.ts`.
5. A new protected **area** (other than `admin`/`member`) needs `role-routes.ts` changes
   (`AppArea`, `ROLE_AREA`, `getAreaFromPathname`) and a layout with `AuthGate`.

### Add a translation

1. Add the key to `messages/en/<file>.json` **and** `messages/bn/<file>.json`.
2. Use it with `useTranslations("Namespace")` (client or server component with
   `setRequestLocale`) or `getTranslations({ locale, namespace })` (server).
3. Public page + client component + new namespace → add it to `PUBLIC_CLIENT_MESSAGES`.
4. Interpolate values (`t("key", { count })`), never concatenate.

### Add a shared component

Only when a second real use exists. Put primitives (no app knowledge) in `components/ui`,
app-wide pieces in `components/shared`; use design tokens, accept `className`, translate every
text through props or `useTranslations`, and document it in [UTILITIES.md](UTILITIES.md).

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

There is no automated test suite and no CI workflow. Before a pull request also check by hand:
the changed pages in **both** languages, on a phone width and a desktop width, with the keyboard,
and the loading / empty / error states (stop the backend to see network errors).

## Deployment

- Hosting: Vercel (<https://somitikhata.vercel.app>), Next.js defaults (no `vercel.json`).
  Project settings are not in the repository (**needs confirmation**).
- Set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL` in the Vercel project; they are built
  into the bundle, so **redeploy** after changing them.
- Add the deployed origin (and any custom domain) to the backend's `FRONTEND_URL`.
- Production cookies are `Secure; SameSite=None` on the API's origin: both sites must use HTTPS.
  Browsers that block third-party cookies can drop them when the app and the API are on different
  sites; serving both under one site (e.g. `app.example.com` and `api.example.com`) avoids that.
- Other hosts: `npm ci && npm run build && npm start` (Node 20.9+).
- After deploying: open the home page in both languages, sign in, open a list and a report, check
  the browser console for errors.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Zod error about `NEXT_PUBLIC_API_BASE_URL` | Missing or not a full URL; include `http(s)://` and `/api/v1`; restart/rebuild |
| Every request fails, console shows CORS | Backend not running, wrong base URL, or this origin missing from the backend's `FRONTEND_URL` |
| `403 Request origin is not allowed` when saving | Same: the backend's `FRONTEND_URL` |
| Signed in, but every page goes back to `/login` | Cookies not stored or not sent: production needs HTTPS on both sides; check third-party cookie settings; check `withCredentials` was not removed |
| Stuck on the profile page after sign-in | `mustChangePassword` is true; change the password |
| A Bangla date is one day off | Formatted without `timeZone: DHAKA_TIME_ZONE` |
| An amount is 100× too large or small | Paisa vs taka mix-up; use `Money`/`formatPaisa` for display and send taka in bodies |
| A list shows another member's rows for a moment | Use `keepPreviousInScope` instead of `keepPreviousData` |
| Raw key such as `Members.title` on screen | Missing key in one locale, or a public client component reading a namespace not in `PUBLIC_CLIENT_MESSAGES` |
| `useSearchParams` build error | Wrap the page's client component in `<Suspense>` |
| Canonical / sitemap URLs show `localhost` | Set `NEXT_PUBLIC_SITE_URL` |
| Data does not update after an action | The mutation does not invalidate the key that shows it |
