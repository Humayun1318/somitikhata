# AI Developer Guide (frontend)

Instructions for AI coding assistants (and humans working the same way) on **somitikhata**, the
SomitiKhata web app. The root [AGENTS.md](../AGENTS.md) is the short version that tools load
automatically; this is the full version.

The app shows **real people's money**. A display bug can make a member or an officer act on a
wrong number. Be careful, be explicit, and ask when unsure.

## Contents

- [Before you start](#before-you-start)
- [Hard rules](#hard-rules)
- [How to work](#how-to-work)
- [Where things are](#where-things-are)
- [Reuse before you write](#reuse-before-you-write)
- [When to stop and ask](#when-to-stop-and-ask)
- [Verifying your work](#verifying-your-work)
- [Reporting](#reporting)
- [Backend coordination](#backend-coordination)

## Before you start

Read, in this order:

1. [README.md](../README.md)
2. [ARCHITECTURE.md](ARCHITECTURE.md) and [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
   (conventions and the feature rules)
3. [DESIGN.md](DESIGN.md) for any UI work, [API.md](API.md) for any data work,
   [AUTHENTICATION.md](AUTHENTICATION.md) and [ERROR_HANDLING.md](ERROR_HANDLING.md) when relevant
4. The feature folder you change, and one similar feature, before writing code
5. The backend's API documentation for every endpoint you use (`docs/API.md` and Swagger UI in the
   backend repository)

If docs and code disagree, the code is what runs: report the difference instead of silently
following either.

## Hard rules

1. **Every request through `httpKit`.** Never `fetch`/new axios; never read or store tokens.
2. **Server state in TanStack Query** hooks inside the feature's `hooks/`; keys from the
   feature's `query-keys.ts`; invalidate what a mutation changes (and `invalidateSummaries` for
   money, members, loans, heads, settings).
3. **Money:** responses are paisa → `Money`/`formatPaisa`; request bodies are taka; amount filters
   are paisa. Never divide by 100 in a component; never recompute balances or limits.
4. **Dates:** day dates are Dhaka midnight → format with `DHAKA_TIME_ZONE`; inputs with
   `toDhakaDateString()`; range filters with `dhakaDayStart`/`dhakaDayEnd`.
5. **No hard-coded user text.** Every string (including `aria-label`, `alt`, toasts) comes from
   `messages/<locale>/…json`, added to **both** `en` and `bn`.
6. **One pattern per job:** `Dialog` + `DialogActions`, `SelectMenu`, `SegmentedControl`,
   `Button`, `FormField`, list-state components, `QueryState`. No native `<select>`, no new UI
   library.
7. **JSX rule:** logic before `return`, only JSX inside it.
8. **Do not invent** endpoints, query parameters, fields, business rules, URLs or data. If the API
   does not support something, show `ComingSoon`; never sample data.
9. **Client guards are not security.** The API enforces permissions; do not add auth to
   `proxy.ts`.
10. **Never expose secrets.** Only `NEXT_PUBLIC_*` variables exist here and they are public.
11. **Do not modify unrelated code**; no drive-by refactors or reformatting.
12. **No new package** without a concrete, named need and the owner's approval.

## How to work

- Keep implementations simple, reusable and production-ready; match the feature next to yours.
- File names kebab-case; components PascalCase; one hook per file.
- Forms: react-hook-form + Zod built with `t`; `useSubmitLock`; `isBusy`; map server errors with
  the feature's `*-errors.ts`; `meta.loadingMessage` on mutations.
- Lists: URL state, backend `meta`, page reset on filter change.
- Accessibility: labels, focus, semantic HTML, translated ARIA text.
- Update the docs in the same change (feature rules in DEVELOPMENT_GUIDE, API.md table,
  UTILITIES.md for shared pieces).
- Work on a feature branch; the owner merges.

## Where things are

| Need | Look in |
|---|---|
| A page | `src/app/[locale]/(dashboard)/<area>/…/page.tsx` → a feature component |
| Feature logic | `src/features/<name>/` |
| API calls | `src/features/<name>/api.ts` |
| Query keys / invalidation | `src/features/<name>/query-keys.ts`, `invalidate-*.ts`, refresh hooks |
| Primitives / shared UI | `src/components/ui/`, `src/components/shared/` |
| HTTP, query client, money, dates, metadata | `src/lib/` |
| Translations | `messages/<locale>/<area>.json`, list in `src/i18n/messages.ts` |
| Sidebar | `src/features/dashboard/config/sidebar.ts` |
| Auth guards, roles | `src/features/auth/` |
| Design tokens | `src/app/globals.css` |

## Reuse before you write

Check [UTILITIES.md](UTILITIES.md). In particular: `formatPaisa`/`Money`, `takaToPaisa`,
`TAKA_INPUT_PATTERN`, `toDhakaDateString`, `dhakaDayStart/End`, `fiscalYear*` helpers,
`addressSchema`/`AddressFields`, `PASSWORD_RULES`, `useSubmitLock`, `useDebouncedValue`,
`keepPreviousInScope`, `QueryState`, `ListLoading/Empty/Error`, `Pagination`, `SearchInput`,
`SortableHeader`, `PageHeader`, `StatCard`, `useToast`, `useMe`, `role-routes`, `endSession`,
`invalidateSummaries`, `invalidateMemberViews`, `pageTitleMetadata`/`publicPageMetadata`.

## When to stop and ask

Ask the project owner before:

- adding a dependency, a new design token, a dark theme or a new UI pattern;
- building UI for something the API does not support, or changing what a role can see/do;
- changing auth, session handling, cookies or security headers;
- broad refactors, moving folders, renaming routes (URLs are shared and bookmarked);
- deleting files or data, rewriting Git history, force-pushing;
- anything that touches production settings or deployments.

When a request is ambiguous, state the options and their effects instead of guessing.

## Verifying your work

Run and read the output of:

```bash
npm run lint
npm run typecheck
npm run build
```

Then check by hand with the backend running: the changed pages in `bn` and `en`, phone and
desktop widths, keyboard navigation, loading / empty / error states, and that amounts and dates
match the API response. There is no automated test suite.

## Reporting

When you finish, report:

- what changed and why, file by file;
- which checks you **actually ran** and their results; never claim a check passed if you did not
  run it;
- what you could not verify (for example, no backend available), assumptions, and decisions the
  owner must make;
- follow-ups you noticed but left out of scope.

## Backend coordination

The app depends on the backend's response envelope, paisa amounts, field names, error messages
parsed by the `*-errors.ts` mappers (for example `login-errors.ts`), and the meaning of 401
(token refresh). If your change needs a backend change, or a backend change breaks one of these,
say so explicitly in your report.
