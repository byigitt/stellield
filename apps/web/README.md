# Web App · Next.js Dashboard

Stellield's web interface delivers the landing page, authenticated dashboard, and analytics views.

## Features
- Landing hero with portfolio highlights and call-to-action
- Dashboard cards fed by DeFiLlama metrics via tRPC
- Portfolio simulator with AI recommendations preview
- Bridge estimator, yield opportunities grid, and transaction timeline components

## Quick Start
```bash
pnpm install           # run once from repo root
pnpm dev:web           # launches on http://localhost:3001
```

Environment variables inherit from the root `.env`. Ensure `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_AGENT_API_URL`, and `NEXT_PUBLIC_PRIVY_APP_ID` are set before building.

## Build & Deploy
```bash
pnpm --filter web build
pnpm --filter web start
```
The Docker target `docker/web.Dockerfile` creates a standalone Next.js build for production.
