# SomitiKhata

Cooperative (somiti) management web app for BKS Lohagara. Next.js 16 App Router, TypeScript, Tailwind 4, TanStack Query, next-intl (bn / en).
Auth is cookie based: the backend (separate origin) sets HttpOnly access/refresh cookies. The frontend never stores or reads a token.

## Run

    cp .env.example .env.local
    npm install
    npm run dev

Scripts: dev, build, typecheck, lint.

## Structure

    src/
      app/            routing only: layouts, pages, error/loading/not-found, manifest
      features/<x>/   everything for one feature: api, query-keys, types, schemas, hooks, components
      components/     ui (primitives), shared (cross-feature), layout (public navbar/footer)
      lib/            env, api-errors, http (axios + refresh), query (TanStack setup), cn, format
      providers/      app-level client providers
      i18n/           next-intl routing, navigation, request config
      proxy.ts        next-intl locale routing
    messages/         bn.json, en.json
    docs/             engineering guide

Adding a feature: add the route in app/, then features/<name>/{api,query-keys,types,hooks,components}. Use httpKit for every request.
