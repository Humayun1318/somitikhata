# api-design.md

This document defines the API **contract** — the shape every service in `architecture.md` §4 is built against. In Phase 1–13 this contract is fulfilled by mock functions; in Phase 14 it's fulfilled by real Express routes. The contract itself does not change between the two.

## 1. Conventions

- All endpoints are versioned under `/api/v1/...` from the start (costs nothing now, avoids a breaking change later if a v2 is ever needed).
- Response envelope, consistent across every endpoint:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "MEMBER_NOT_FOUND", "message": "..." } }
```
- Pagination (for list endpoints — members, deposits history, loans): `?page=1&limit=20`, response includes `{ "data": [...], "meta": { "page": 1, "totalPages": 25, "totalItems": 487 } }`.
- Dates: ISO 8601 strings over the wire, formatted for display only in the frontend (locale-aware, per `i18n.md`).
- Money: always transmitted as a plain number in the smallest sensible unit for the currency in use here (taka, not paisa — BDT doesn't have a commonly-used sub-unit in this context) — never as a pre-formatted string like `"৳500"`.

## 2. Endpoints by Module

### Auth
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Enforces the pre-approval check (`authentication.md`) |
| POST | `/api/v1/auth/login` | |
| POST | `/api/v1/auth/logout` | |
| GET | `/api/v1/auth/session` | Current session/role — used by `middleware.ts` |

### Members
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/members` | Admin — paginated list, filterable by status |
| GET | `/api/v1/members/:id` | Admin/self — member detail |
| POST | `/api/v1/members/pre-registrations` | Admin — add a pre-approved phone/email |
| PATCH | `/api/v1/members/:id` | Admin — edit member info / status |

### Deposits
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/deposits?memberId=&periodId=` | Filterable deposit history |
| GET | `/api/v1/members/:id/balance` | Computed current balance (see `business-rules.md` §1) |
| POST | `/api/v1/deposits` | Admin/staff — record a deposit |
| POST | `/api/v1/deposits/:id/correct` | Admin — creates a correction entry, never edits in place |
| GET | `/api/v1/deposit-periods` | List periods, open/closed status |
| POST | `/api/v1/deposit-periods/:id/close` | Admin — close a period once finalized |

### Assets
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/assets` | List |
| POST | `/api/v1/assets` | Admin — create |
| PATCH | `/api/v1/assets/:id` | Admin — update valuation |
| GET | `/api/v1/assets/:id/shares` | Per-member share breakdown |
| POST | `/api/v1/assets/:id/recalculate-shares` | Admin — trigger recompute (see `business-rules.md` §2) |

### Loans
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/loans?memberId=&status=` | Filterable list |
| POST | `/api/v1/loans` | Member — apply, or Admin — record on a member's behalf |
| PATCH | `/api/v1/loans/:id/approve` | Admin |
| PATCH | `/api/v1/loans/:id/reject` | Admin |
| GET | `/api/v1/loans/:id/payments` | Installment history |
| POST | `/api/v1/loans/:id/payments` | Admin/staff — record a repayment |
| GET | `/api/v1/loan-eligibility-rules` | Admin |
| PATCH | `/api/v1/loan-eligibility-rules/:id` | Admin — configure rules (pending `client-questions.md`) |

### Reports
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/reports/summary?periodId=` | Admin dashboard financial summary |
| GET | `/api/v1/reports/members/:id/statement` | Single member statement |

### Notifications
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/notifications?memberId=&status=` | Admin — SMS log |
| POST | `/api/v1/notifications/:id/resend` | Admin — retry a failed SMS |

## 3. Mock vs. Real Structure

**Now:** each row above corresponds to one function in the relevant `*-service.ts` file (`architecture.md` §4), implemented against `lib/mock-data/`. There is no actual HTTP call — the function signature already matches what it will be.

**Phase 14:** each row becomes one Express route handler, following the same `catchAsync` / `sendResponse` / `AppError` pattern already used in production Express work, with the response envelope in §1 above matching what `sendResponse` emits. Validation at the route level uses the same Zod schemas the frontend forms already use (`architecture.md` §4) — copied into the Express project (or extracted to a shared package if the two codebases end up in a monorepo — a decision deferred to Phase 14, not needed now).
