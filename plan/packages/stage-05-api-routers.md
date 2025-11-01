# Stage 05 – tRPC Routers (Packages)

1. Implement `yieldRouter`, `riskRouter`, `recommendRouter`, and `bridgeRouter` inside `packages/api/src/routers`.
2. Compose routers into `appRouter` and export corresponding type definitions for frontend usage.
3. Add rate limiting middleware (per IP/session) to protect testnet endpoints from abuse.
4. Generate client utilities via existing shared TRPC client builder; ensure inference types cover new procedures.
5. Document router contracts in inline JSDoc for quick reference during PoC demos.
