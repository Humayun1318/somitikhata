# AGENTS.md

Instructions for AI coding agents working on **somitikhata**, the SomitiKhata web app (Next.js 16
App Router, React 19, TypeScript, Tailwind 4, next-intl, TanStack Query). Full version:
[docs/AI_DEVELOPER_GUIDE.md](docs/AI_DEVELOPER_GUIDE.md).

## Read first

[README.md](README.md) → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) →
[docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) → [docs/DESIGN.md](docs/DESIGN.md) /
[docs/API.md](docs/API.md), then the feature you change. Check
[docs/UTILITIES.md](docs/UTILITIES.md) before writing any helper or component.

## Commands

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
npm run dev
npm run lint
npm run typecheck
npm run build
```

There is no test suite; verify in the browser in both languages.

## Rules

- Requests only through `httpKit`; never store tokens. Auth is HttpOnly cookies on the API origin.
- Server state with TanStack Query hooks in `features/<name>/hooks`; keys in `query-keys.ts`;
  invalidate what you change (+ `invalidateSummaries` for money/members/loans/heads/settings).
- Money: responses paisa → `Money`/`formatPaisa`; bodies taka; amount filters paisa.
- Day dates: Dhaka (`DHAKA_TIME_ZONE`, `toDhakaDateString`, `dhakaDayStart/End`).
- No hard-coded text: add keys to `messages/en` **and** `messages/bn`.
- Reuse `Dialog`, `DialogActions`, `SelectMenu`, `Button`, `FormField`, list states, `QueryState`.
- JSX rule: logic before `return`; `return` only JSX. Kebab-case file names.
- Don't invent endpoints, params, fields, rules, URLs or data; unsupported → `ComingSoon`.
- Client guards are not security; no auth in `src/proxy.ts`.
- Don't modify unrelated code; no new dependency without approval.
- Ask before destructive operations, broad refactors, auth/security changes, route renames.
- Feature branches only; the owner merges. Report which checks you actually ran.
