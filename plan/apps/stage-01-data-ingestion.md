# Stage 01 – Server Data Ingestion (Apps)

1. Create `apps/server/src/jobs/index.ts` exporting BullMQ queue/worker registration helpers.
2. Implement `ledger-sync.job.ts` to call ValidationCloud testnet `getLatestLedger` every 5 minutes; log lag metrics and push alerts if lag >10 minutes.
3. Build `yield-source.job.ts` querying AMM pool and Soroban contract data via `getLedgerEntries`/`getEvents`; normalize into DTOs.
4. Write job unit tests using mocked fetch responses (Vitest) to ensure parsing handles missing fields and pagination.
5. Register jobs in server bootstrap (`src/index.ts`) so they start with the app during `pnpm dev:server`.
