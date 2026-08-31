# SomitiKhata Project Architecture

## 1. Project overview

SomitiKhata is a cooperative savings, loan, and shared-asset management product designed for Bangladeshi member-based organizations. The project is built as a docs-first Next.js application focused on a clean, mobile-friendly public experience and a future-ready modular structure for protected member/admin areas.

The current implementation is intentionally limited to the public-facing prototype layer and the supporting project architecture documentation. Advanced backend functionality, private dashboards, protected role flows, and production data operations are not treated as implemented yet unless they are explicitly present in code.

### Primary users

- Cooperative committee/admin staff
- Registered members
- Prospective members evaluating the platform

### Core goals

- Track deposits and savings in a transparent way
- Show member balances and account status clearly
- Support loan visibility and repayment tracking later
- Track shared asset values and member share distribution later
- Offer a bilingual public experience in English and Bangla
- Keep the implementation simple, maintainable, and scalable for future backend integration

---

## 2. Technology stack used by the project

The project currently uses the following actual stack:

- Framework: Next.js 16 with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- UI primitives: custom app components and existing design tokens; no heavy UI framework is required for the current prototype
- Icons: emoji-based visual accents are currently used in the public UI; no additional icon package has been added
- State management: local component state and plain React patterns; no global state library is currently required
- Data layer: mock data layer under `src/lib/mock-data`
- API/data access: service-layer pattern prepared in `src/services` and `src/lib/mock-data` with a design that can later swap to real API services
- Authentication: planned architecture is Auth.js/NextAuth Credentials flow for later phases; this is not implemented as real protected auth yet
- Validation: Zod is included in the dependency list for future form validation flows
- PWA support: Serwist via `@serwist/next`
- i18n: locale-based route structure with a custom message catalog approach that supports English and Bangla public text
- Deployment-related tooling: Next.js build, dev server, static generation, and standard front-end hosting support

This document intentionally avoids listing technologies that are not actually used in the codebase today.

---

## 3. Project architecture

### High-level architecture

```text
Browser
  ↓
Next.js App Router
  ↓
Public routes / locale routes / future protected routes
  ↓
Static/mock frontend layer
  ↓
Future service layer + Express API + database (planned, not implemented yet)
```

### Current frontend architecture

The current implementation is a static front-end prototype. Public pages live in locale-aware route folders and render from a shared message catalog. The app is organized to keep route structure clean and future protected routes easy to add without disturbing the public experience.

### Protected vs public areas

- Public routes: landing page and public information sections
- Auth routes: login/register screens are present in the locale route structure
- Member/admin routes: route structure exists for later protected experience, but the current scope remains public-focused only

### Route structure

The current app uses locale-prefixed routes that follow the app-router pattern:

```text
src/app/
├── page.tsx                  # root redirect to /bn
├── [locale]/
│   ├── (public)/page.tsx
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── member/...          # planned protected member flow
│   ├── admin/...           # planned protected admin flow
│   └── layout.tsx
├── globals.css
├── layout.tsx
├── manifest.ts
├── icon.svg
└── sw.ts
```

### Component structure

The project uses a light, maintainable structure:

```text
src/
├── app/
├── components/
│   ├── shared/
│   └── ui/
├── lib/
│   ├── i18n/
│   ├── mock-data/
│   └── utils/
├── services/
└── proxy.ts
```

### Data flow

Current public pages do not call a backend. They render from a local message catalog and mock content objects in the front end. This keeps the prototype stable, reviewable, and free from premature backend coupling.

### Authentication flow

Authentication is planned but not implemented in the current public-only scope. The repo docs describe a future Auth.js-based flow with role-based access for member/admin routes, but the actual code does not enforce those permissions yet.

---

## 4. Folder and file structure

### app/

Responsible for route-level UI and metadata.

- `src/app/page.tsx`: root redirect to default locale
- `src/app/[locale]/(public)/page.tsx`: public landing page
- `src/app/[locale]/(auth)/login/page.tsx`: public login route
- `src/app/[locale]/(auth)/register/page.tsx`: public registration route
- `src/app/[locale]/layout.tsx`: locale route wrapper
- `src/app/manifest.ts`: PWA manifest
- `src/app/icon.svg`: app icon fallback
- `src/app/globals.css`: design tokens and app-wide styles

### components/

Reusable UI fragments and shared layout elements.

- `shared/app-shell.tsx`: common shell used in app screens
- `shared/stat-card.tsx`: reusable stat card pattern
- `shared/status-badge.tsx`: status label styling

### lib/

Shared logic and static data.

- `lib/i18n/messages.ts`: centralized English/Bangla message catalog for public UI
- `lib/mock-data/index.ts`: mock data layer for future pages
- `lib/utils/cn.ts`: class concatenation utility

### services/

Prepared for future API abstraction and backend data access. This is intentionally not used for real backend work in the current public-only scope.

---

## 5. Design system and principles

### Design philosophy

The project emphasizes trust, clarity, and financial practicality for cooperative communities. The visual language is meant to feel dependable, local, and clean rather than flashy or overly experimental.

### Layout principles

- Mobile-first layout
- Spacious content blocks with clear breathing room
- Strong headline hierarchy
- Clear section separation using borders and light surfaces
- Cards for features, KPIs, and important summaries
- Comfortable spacing between sections and content groups

### Spacing and sizing

- Generous padding on small screens
- Card radius values are consistent and moderate
- Large section spacing between key blocks
- Dense data areas stay readable without feeling cramped

### Visual tokens currently in use

CSS variables in `src/app/globals.css`:

- Primary: `#0f6b4f`
- Secondary: `#1e3a5f`
- Background: `#f7f8f7`
- Surface: `#ffffff`
- Border: `#e3e6e4`
- Text: `#111827`
- Muted text: `#5b6660`
- Success: `#1a8a5f`
- Warning: `#b8860b`
- Error: `#b3261e`
- Info: `#2563eb`

### Buttons

- Primary actions use a green filled button
- Secondary actions use white surfaces with border
- CTA buttons are prominent and easy to tap on mobile
- Buttons are high contrast and large enough for touch interaction

### Forms

- Simple card-container layout
- Inputs use border and rounded corners
- Labels should be clearly associated with fields
- Mobile-friendly spacing and sizes

### Responsive behavior

- Public landing page collapses into a single-column stack on mobile
- Hero section becomes two-column on larger screens
- Feature grids adapt from 1 column to 2 or 4 columns depending on width
- CTA sections remain centered and readable on all sizes

### Accessibility principles

- Use semantic headings and landmarks
- Keep interactive elements large and easy to tap
- Ensure text contrast remains above readable thresholds
- Focus states should be visible
- Do not rely on color alone for meaning

---

## 6. Color system

The actual project uses a conservative cooperative palette focused on trust and clarity.

| Role | Value |
|---|---|
| Primary | `#0f6b4f` |
| Primary hover | `#0c5a42` |
| Secondary | `#1e3a5f` |
| Background | `#f7f8f7` |
| Surface | `#ffffff` |
| Border | `#e3e6e4` |
| Text | `#111827` |
| Muted text | `#5b6660` |
| Success | `#1a8a5f` |
| Warning | `#b8860b` |
| Error | `#b3261e` |
| Info | `#2563eb` |

These values are the design tokens used by the current implementation and should remain the system baseline.

---

## 7. Typography

The project is designed around a readable, modern sans-serif system:

- English: `Inter`, `Noto Sans`, system-ui, sans-serif
- Bangla: `Hind Siliguri`, `Noto Sans Bengali`, system-ui, sans-serif

### Typography rules

- Strong visual hierarchy on the hero headline
- Clear heading structure for each section
- Body text kept comfortable and readable on mobile
- Buttons maintain readable weight and sizing
- Public page text should remain concise and easy to scan

---

## 8. Icons and visual assets

### Current icon usage

- The current public-facing implementation uses emoji-style icons in the feature cards for quick visual differentiation.
- No extra package such as `lucide-react` has been added to the project yet.
- The icon system is intentionally lightweight and low-overhead for the public prototype.

### Rules

- Use icons only when they add understanding, not decoration.
- Keep them visually simple and consistent with the product style.
- Use minimal icon usage in public sections to avoid noise.
- Avoid overusing emoji in complex or data-heavy sections.

### Fallback asset rule

All app metadata icons should have a valid fallback. When a source asset is missing, the app must still provide a valid fallback SVG in `public/icon.svg` or `src/app/icon.svg` and reference it in the manifest or metadata.

---

## 9. Component guidelines

### Reuse first

Before creating a new component, check whether an existing shared pattern already fits the need.

### Component conventions

- Keep components small and single-purpose
- Prefer reusable patterns over ad hoc layout code
- Name components by role, not by page-specific behavior
- Keep business logic separate from presentation whenever possible

### Current reusable patterns

- `AppShell` for shared layout structure
- `StatCard` for metric cards
- `StatusBadge` for state labels

### New public page content should follow the current style tokens and card structures rather than inventing a separate visual system.

---

## 10. Public pages

### Public routes

The public experience lives under the locale route structure and includes:

- /bn and /en root public landing page
- /bn/login and /en/login
- /bn/register and /en/register

### Public page purpose

The landing page communicates the product value clearly and explores the cooperative savings and asset model without exposing private data.

### Required sections

- Hero section
- How-it-works section
- Feature section
- Trust/accountability section
- FAQ section
- CTA block
- Footer

### Navigation

- The public layout has a top nav for landing sections
- A language toggle is visible and functional
- Primary actions direct users to login or registration

### Language switching

The public UI is locale-driven and should preserve route integrity. A switch from /bn to /en should keep the user on the same public page section, not send them to the root page unexpectedly.

---

## 11. Internationalization

### Supported languages

- en → English
- bn → বাংলা

### Current locale strategy

- Locale appears in route prefix for public routes
- Default locale is Bangla
- English remains available as a one-tap language switch

### Translation structure

The current implementation uses a centralized message object in `src/lib/i18n/messages.ts`.

This approach is intentionally simpler and more maintainable than scattering strings directly in JSX. It is appropriate for a small product and allows easy extension to additional languages later.

### Rules for user-facing text

- Do not hardcode user-visible strings directly in JSX when they are part of the UI language surface.
- Keep all public-facing text in the shared translation catalog.
- When adding a new public copy block, add it to the `messages` object for each locale.

---

## 12. Authentication and authorization

### Current status

Not fully implemented in the public-only scope.

### Planned model

- Role-based access for admin vs member routes
- Committee-based approval flow for registrations
- Session-based protection in the future middleware layer
- Auth.js/NextAuth Credentials provider design for later implementation

### Current reality

The public pages are intentionally not protected and can be used as a reviewable UI without backend enforcement.

---

## 13. API and data layer

### Current status

The app is still front-end only. Public pages render from local copy and static mock arrays, not from live API responses.

### Planned service-based architecture

The design is prepared for a future service layer with:

- `services/*.ts` abstractions
- `mock-data` as the in-memory source for demo work
- a replacement path to real HTTP API calls during later production integration

### Important rule

The frontend should remain decoupled from backend specifics until the backend exists, to keep the app reviewable and maintainable.

---

## 14. Coding conventions

### Naming

- Use TypeScript for all modules
- Prefer descriptive names over abbreviated ones
- Keep route/page names aligned with feature purpose
- Keep imports stable and consistent

### Import conventions

- Prefer project-relative aliases where available
- Keep imports short, explicit, and readable
- Do not create unnecessary utility layers before they are needed

### File naming

- Use lowercase file names with descriptive names
- Keep route files named `page.tsx` and folder names meaningful

### Formatting and linting

- Follow the existing Next.js TypeScript conventions
- Keep code readable and maintainable
- Avoid introducing complexity before it is needed

---

## 15. UX rules

- Keep the public experience clean and informative
- Avoid empty placeholder text or meaningless filler
- Use realistic business language tied to cooperative operations
- Preserve clear hierarchy and readability across devices
- Maintain consistent button and card styling across all sections
- Driving actions should remain obvious and visible

---

## 16. Responsive design

### Mobile

- Single-column stacking for core sections
- Buttons should remain large and thumb-friendly
- Headings should wrap cleanly without overflow

### Tablet

- Feature cards can move to two-column or three-column layouts
- Header remains compact but legible

### Desktop

- Hero section can become split layout
- Feature blocks can expand to multiple columns
- Content remains easy to scan while preserving whitespace

### Large desktop

- Content sits in a centered max-width container
- Layout remains airy and not overly dense

---

## 17. Accessibility

- Semantic HTML should be used whenever possible
- Labels must be clear and text should remain readable
- Buttons and controls must have visible focus states
- Page headings should remain in a logical order
- Avoid relying only on color to convey meaning
- Public pages should be usable with keyboard navigation and screen readers

---

## 18. SEO

The public pages are indexable. The current implementation includes a public route and valid metadata for the app, with an icon fallback and locale-aware structure designed for future SEO expansion.

Planned SEO work includes:

- Language-specific public route metadata
- Alternate locale metadata when expanded
- Public page titles and descriptions tuned to the cooperative audience
- sitemap/robots expansions later when the site becomes more complete

---

## 19. Development rules for future contributors

- Do not introduce new dependencies without explicit approval.
- Reuse the current UI patterns and design tokens.
- Do not hardcode user-visible static strings into JSX for public pages.
- Keep the public pages production-quality before expanding to private/dashboard areas.
- Preserve the actual project architecture rather than rewriting the project to match older assumptions.
- Follow the docs when they are consistent with the actual codebase; when they conflict, the current implementation and project decisions take priority, and the project documentation should be updated clearly as needed.

---

## 20. Implementation status

### Implemented

- Public landing page with responsive sections
- English and Bangla public copy using shared locale messages
- Locale-aware route structure for public pages
- Default route redirects to Bangla
- PWA manifest and valid fallback app icon
- Basic public auth entry screens

### Planned

- Full member/admin dashboards
- Role-based middleware and auth enforcement
- Real backend and database integration
- Real form validation flows
- Full Bn/En translation coverage across all future pages

### Not implemented

- Real production database
- Real authenticated session system
- Actual payment or finance processing
- Real admin/member private features beyond the public prototype scope

---

## Final decision summary

The current project is a Next.js public-first prototype with a clear path toward more advanced private features, but the codebase is intentionally kept simple and reviewable for the present phase. The public UI is the current implementation target, and all major user-facing text is centralized to keep English/Bangla switching clean and maintainable.
