# Contributing

Contributions go through pull requests that the repository owner reviews and merges.

## Contents

- [Before you start](#before-you-start)
- [Branches](#branches)
- [Commits](#commits)
- [Pull requests](#pull-requests)
- [Review checklist](#review-checklist)
- [Security issues](#security-issues)

## Before you start

- Read the [README](../README.md), [ARCHITECTURE.md](ARCHITECTURE.md),
  [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) and [DESIGN.md](DESIGN.md).
- Features need a backend endpoint. If the API does not support something yet, discuss it first
  (the backend lives in a separate, private repository).
- Ask before adding a dependency or changing the design system.

## Branches

- `main` is deployed. Never commit to it directly.
- Branch from an up-to-date `main`: `feature/<topic>`, `fix/<topic>`, `docs/<topic>`,
  `chore/<topic>`. One topic per branch.

## Commits

The history uses short conventional-style subjects, for example:

```text
feat(documents): photo, NID and signature images for members and nominees
feat(next): page metadata, SEO routes and leaner public pages
```

Imperative mood, a scope when it helps, one logical change per commit. Never commit `.env.local`
or other env files with real values.

## Pull requests

1. Run the checks and make sure they pass:

   ```bash
   npm run lint && npm run typecheck && npm run build
   ```

2. Check the changed screens by hand: `bn` and `en`, phone and desktop, keyboard, loading / empty /
   error states.
3. Open the pull request against `main` with: what changed, why, screenshots for UI changes, how
   you tested (commands and manual checks), any backend change it depends on.

## Review checklist

- [ ] Follows [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) conventions and feature rules.
- [ ] Requests through `httpKit`; hooks, keys and invalidation in place.
- [ ] Money and dates handled with the shared helpers.
- [ ] All text translated in both locales; accessible labels.
- [ ] Uses the shared components; no new UI pattern or package without agreement.
- [ ] Loading, empty, error and busy states covered.
- [ ] Docs updated where behaviour or shared pieces changed.
- [ ] No secrets, no debug logging, no unrelated changes.

## Security issues

Do not open a public issue for a vulnerability; this repository is public. Contact the owner
privately through GitHub.
