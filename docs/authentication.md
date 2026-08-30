# authentication.md

## 1. The Core Requirement

No one may create a login account unless an admin has already pre-approved their phone number or email. This must be enforced **server-side**, not just hidden behind frontend UI — a public API endpoint that skips this check is the same as not having the rule at all.

## 2. Flow

```
Admin creates a MemberPreRegistration record
   { contact: "01xxxxxxxxx" or "name@email.com", status: "pending" }
        ↓
Person visits /register, enters the same contact + a password
        ↓
Backend checks: does a MemberPreRegistration with this exact contact exist and have status "pending"?
        ↓
   NO  → registration rejected, generic error message
        (does not reveal whether the contact exists at all, to avoid
         leaking the member list to someone probing random numbers)
        ↓
   YES → create User record, link to the Member record (creating one if it
        doesn't exist yet), mark MemberPreRegistration status "claimed",
        allow login
```

### Where this check lives, by phase

| Phase | Where the check runs | Why |
|---|---|---|
| Demo (Phase 5) | Inside the mock `authService.register()` function, checking `lib/mock-data/pre-registrations.ts` | Same interface as the real check — see `architecture.md` §4 |
| Production (Phase 14) | Express `POST /api/auth/register` endpoint, querying the real `MemberPreRegistration` collection | **This is the only version that actually matters for security.** The demo-phase check exists to build and test the UI/UX flow correctly, not as a security boundary — it's trivially bypassable client-side code, which is fine, because there's no real data behind it yet. |

This distinction is stated explicitly here so it's never mistaken for "already secure" during the demo phase.

## 3. Auth.js (NextAuth v5) Configuration

- **Credentials provider**, `authorize()` calls the abstracted `authService.login()` (mock now, real HTTP call later — same swap pattern as every other service).
- Session strategy: JWT-based session (Auth.js default), containing `userId`, `role`, and `memberId` — enough for `middleware.ts` to route-protect without an extra database round-trip on every request.
- Password hashing: **bcrypt**, done server-side only (in the mock phase, in the mock auth function; in production, in the Express backend — never in the Next.js frontend, which should never see or store a raw password beyond the single submission request).

## 4. Adding Google Login Later Without Breaking the Membership Model

This is designed for now, even though it isn't implemented until later, specifically so it can be added as a provider addition, not an architecture change:

```
Person clicks "Sign in with Google"
        ↓
Google OAuth returns the person's verified email
        ↓
Auth.js signIn() callback intercepts BEFORE session creation:
   does a MemberPreRegistration or existing Member/User record
   exist with this exact email?
        ↓
   NO  → signIn callback returns false — Auth.js blocks the sign-in,
        person sees "This Google account is not associated with an
        approved membership. Please contact your Somiti admin."
        ↓
   YES → signIn callback returns true, session created, linked to
        the existing Member record (same linkage logic as the
        Credentials flow)
```

The critical point: **the same membership-verification check used for Credentials registration is reused inside the Google provider's `signIn` callback** — it's the same function, called from a second entry point, not a second implementation of the rule that could drift out of sync with the first. A random Google account can never bypass the Somiti membership check, because the check happens before Auth.js ever creates a session, regardless of which provider triggered the sign-in attempt.

## 5. Security — What's Demo-Phase and What's Production-Required

| Concern | Demo phase (Next.js only) | Production requirement (Express + MongoDB) |
|---|---|---|
| Password hashing | Not security-critical yet (no real passwords/data at risk) | bcrypt, server-side, cost factor ≥ 12 |
| Session/token strategy | Auth.js JWT session, mock-backed | Same, but `authorize()` validates against real hashed passwords in MongoDB |
| Rate limiting on login/register | Not implemented | Required — prevents brute-force guessing of the pre-approved contact list |
| Input validation | Zod on the frontend | Zod again, independently, on every Express endpoint — **frontend validation is a UX convenience, never a security boundary; it must be re-validated server-side because a request can always be sent directly, bypassing the UI** |
| CSRF | Handled by Auth.js's built-in protections | Same, plus explicit CORS configuration restricting the Express API to the known frontend origin only |
| XSS | React's default JSX escaping | Sanitize any admin-entered free-text fields (notes, names) before they're ever rendered, even though React escapes by default — defense in depth for a system where "notes" fields could plausibly later be exported into a report/PDF that doesn't get React's automatic escaping |
| Secure cookies | `secure`, `httpOnly`, `sameSite=lax` on the session cookie (Auth.js defaults) | Same, confirmed under real HTTPS in production |
| Environment variables/secrets | Mock phase has none that matter | `DATABASE_URL`, SMS provider API key, session secret — **never committed to git**, set only via the hosting platform's environment variable settings |
| Audit logs | Not applicable (no real actions yet) | Every admin action affecting money or membership status writes an `AuditLog` entry (see `database-design.md`) |
| Database access | N/A | MongoDB access restricted to the Express backend's IP/network only — never exposed to the public internet directly |
| Backups | N/A | Daily automated backup, stored off the primary server (see the separately-produced hosting/deployment research for this project) |

## 6. Roles

Three roles now: `admin`, `staff`, `member`. `staff` exists from day one in the schema (rather than being added later) because in practice, monthly deposit entry for 400–500 members is very plausibly delegated to someone other than the single admin — building this in from the start avoids a later "everyone is either admin or member" refactor. Staff permissions (a subset of admin's — likely deposit entry without loan-approval rights) are configured in Phase 10, not decided in detail here.
