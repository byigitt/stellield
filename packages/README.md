# Packages · Shared Libraries

Workspace packages that power Stellield's backend and shared logic.

## Modules
- `@stellar-hackathon/api` — tRPC routers, procedures, and services (stellar flow simulator, agent proxy)
- `@stellar-hackathon/auth` — BetterAuth wrapper with Prisma adapter and secure cookie settings
- `@stellar-hackathon/db` — Prisma schemas, generated client, and database helpers

## Develop
```bash
pnpm install           # once at repo root
pnpm --filter @stellar-hackathon/api build
pnpm --filter @stellar-hackathon/db db:generate
```

Each package exports ESM modules consumed by the server and web apps. Update Prisma models under `packages/db/prisma/` and regenerate clients as needed.
