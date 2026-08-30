# SomitiKhata — Documentation Index

This `docs/` folder is the single source of truth for the project before any application code is written. Every architectural and design decision lives here first. Code should never contradict these documents — if it needs to, the document gets updated first, in a separate commit, with the reason noted.

## Why a docs-first approach for this project specifically

This will eventually hold real people's savings and loan records. A financial system that's designed as you go tends to accumulate silent inconsistencies (two different "total savings" formulas in two files, a loan status enum that means something different in the UI than in the database). Writing the rules down once, before code, is what prevents that — and it's the only way a solo beginner developer can keep a project like this consistent without a team reviewing every PR.

## Documents in this folder

| Document | Answers the question |
|---|---|
| [`architecture.md`](./architecture.md) | How is the system structured, end to end, and how do we go from the Next.js-only demo to Next.js + Express + MongoDB without rewriting the frontend? |
| [`design.md`](./design.md) | What does the product look like — name, typography, color tokens, component rules, currency formatting? |
| [`information-architecture.md`](./information-architecture.md) | What pages/sections exist on the landing page, admin dashboard, and member dashboard, and why? |
| [`database-design.md`](./database-design.md) | What are the core entities, their fields, and their relationships? |
| [`business-rules.md`](./business-rules.md) | How is a deposit total calculated, how are corrections handled, how is asset share computed? |
| [`authentication.md`](./authentication.md) | How does the admin-pre-approval registration flow work, and how does Google Login slot in later without breaking it? |
| [`api-design.md`](./api-design.md) | What does the API contract look like, in the mock demo and in the real Express backend? |
| [`i18n.md`](./i18n.md) | How does Bangla/English switching work, technically and in terms of URLs and SEO? |
| [`pwa.md`](./pwa.md) | What makes this installable and usable on a slow mobile connection, and what is/isn't safe offline? |
| [`seo.md`](./seo.md) | What gets indexed, what doesn't, and what metadata does each page need? |
| [`project-roadmap.md`](./project-roadmap.md) | What are the 15 phases, in what order, and what must be true before each one starts? |
| [`client-questions.md`](./client-questions.md) | What decisions can't be made by the developer alone — they need an answer from the Somiti committee before Phase 9 (Loans) and parts of Phase 8 (Assets)? |

`deployment.md` is intentionally **not** written in detail yet — see the note at the bottom of `project-roadmap.md`. Writing a full deployment doc now, before the Express backend and database exist, would mean rewriting it later anyway. It will be authored properly in Phase 15, reusing the hosting/cost research already done separately for this project.

## How to use this folder going forward

- Before starting any phase in `project-roadmap.md`, re-read the docs relevant to that phase.
- If a decision made during coding contradicts a doc, stop and update the doc first — don't let the code and the doc drift apart.
- `client-questions.md` should be treated as a blocker list for Phase 9, not a nice-to-have. Loan business rules are guessed at architecturally (the schema supports them) but must not be hardcoded as final until confirmed.
