# Stage 01 – Data Models & Migrations (Packages)

1. Extend `packages/db/prisma/schema.prisma` with `StellarYieldSource` and `StellarYieldSnapshot` models (include asset metadata, source type, ledger refs, net APY).
2. Add relations for historical snapshots per source and indexes on `assetCode` + `capturedAt`.
3. Generate migration (`pnpm db:migrate:dev --name add_yield_models`) and update Prisma client.
4. Implement seed script in `packages/db` to populate testnet sample pools for QA.
5. Export typed helpers (e.g., `listYieldSources`) for server jobs to consume.
