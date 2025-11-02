# API Server · Elysia + tRPC

The server package hosts Stellield's typed backend API, authentication endpoints, and blockchain adapters.

## Responsibilities
- Exposes `/trpc` routes for yield flows (`stellar.*`) and AI recommendations (`agent.*`)
- Serves BetterAuth handlers at `/api/auth/*`
- Bridges to Soroban, Circle CCTP, and Solana SDKs for orchestration tests

## Run Locally
```bash
pnpm install          # once at repo root
pnpm dev:server       # http://localhost:3000
```

Set the following environment variables (see `.env.production.example`):
- `DATABASE_URL` for PostgreSQL access
- `BETTER_AUTH_SECRET`, `CORS_ORIGIN`
- `AGENT_API_URL` pointing at the FastAPI service
- Chain credentials (`STELLAR_PRIVATE_KEY`, `SOLANA_PRIVATE_KEY`, etc.) for full simulations

## Production Build
```bash
pnpm --filter server build
pnpm --filter server start
```
A Bun compile target and Dockerfile (`docker/server.Dockerfile`) are available for containerized deployments.
