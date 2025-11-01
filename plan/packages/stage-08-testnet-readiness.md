# Stage 08 – Testnet Readiness (Packages)

1. Seed testnet database snapshots via scripted migrations to mimic live data volume.
2. Validate Prisma migrations roll forward/backward cleanly in isolated test DB.
3. Produce checklist mapping routers/models to QA scenarios used during stakeholder demos.
4. Archive schema docs for PoC (ER diagrams, table descriptions) inside `packages/db/docs`.
5. Tag package versions in `package.json` to freeze PoC release candidates.
