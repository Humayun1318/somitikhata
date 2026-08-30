# seo.md

## 1. What Gets Indexed

| Route group | Indexed? | Reasoning |
|---|---|---|
| `(public)` — landing page | Yes | The only content meant for a public, non-logged-in audience |
| `(auth)` — login/register | No (`noindex, nofollow`) | Nothing worth ranking for; also avoids a search result linking directly into a login form out of context |
| `(member)` — all member pages | No | Private financial data — must never be indexable, cacheable by a search engine, or reachable without authentication |
| `(admin)` — all admin pages | No | Same, doubly so |

`robots.txt` disallows `/en/login`, `/bn/login`, `/en/register`, `/bn/register`, and both locale prefixes of `(member)`/`(admin)` route groups explicitly, in addition to each protected page carrying its own `noindex` meta tag — belt and suspenders, since route protection (`middleware.ts`) already prevents unauthenticated access, but a defense-in-depth `noindex` costs nothing and guards against edge cases (a leaked link, a misconfigured redirect).

## 2. Metadata (Public Pages Only)

Defined per-locale via Next.js's Metadata API, sourced from the same `messages/*.json` files used for UI text (`i18n.md`) where practical, to avoid maintaining SEO copy in a third, separate location:

| Field | English | Bangla |
|---|---|---|
| Title | "SomitiKhata — Savings, Loans & Asset Tracking for Bangladeshi Cooperatives" | "সমিতিখাতা — বাংলাদেশি সমবায়ের জন্য সঞ্চয়, ঋণ ও সম্পদ ব্যবস্থাপনা" |
| Description | "Digital savings, loan, and shared-asset ledger built for Bangladeshi cooperative societies (somiti) — trusted, bilingual, and mobile-friendly." | "বাংলাদেশি সমিতির জন্য তৈরি ডিজিটাল সঞ্চয়, ঋণ ও যৌথ সম্পদের খাতা — নির্ভরযোগ্য, দ্বিভাষিক ও মোবাইল-বান্ধব।" |
| Open Graph image | A single, static branded image (logo + tagline) — not a dynamic per-page OG image, unnecessary complexity for a one-page public site | same image, locale-appropriate text baked in |
| Favicon | Standard multi-size favicon set generated once the logo exists | — |

## 3. Technical SEO

- `sitemap.xml` generated via Next.js's native `app/sitemap.ts`, listing only the `(public)` route's two locale URLs — trivial given how small the indexable surface is.
- `robots.txt` via `app/robots.ts`, disallowing the routes in §1.
- Canonical URLs: each locale version is canonical to itself, with `hreflang` alternates linking the two (see `i18n.md` §5) — not one locale marked canonical over the other, since they're equally legitimate versions of the same content, not duplicates.
- Structured data (`schema.org` `Organization` type) on the landing page — modest value here (this isn't a content/commerce site competing on rich search results) but essentially free to add and correct practice.

## 4. What This Project Deliberately Does Not Need

Given the actual audience (a specific Bangladeshi cooperative's own members and committee, reached via direct link/word of mouth, not by ranking for competitive search terms) — investing further SEO effort beyond the above (blog content, backlink strategy, extensive keyword targeting) would be effort spent on an audience this product doesn't have. The metadata/sitemap/robots setup above is sufficient for the landing page to be found by someone specifically searching for it, which is the actual use case.
