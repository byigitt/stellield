# Stage 02 – Risk Engine Alpha (Apps)

1. Scaffold `apps/server/src/risk/index.ts` exposing rule evaluators (integrity, liquidity, stability, network, operational).
2. Create BullMQ worker `risk-score.job.ts` consuming new snapshots and writing results via service layer.
3. Add config-driven weighting (loaded from `packages/api`) and allow runtime overrides via env or admin API.
4. Emit structured logs + metrics for each score (risk tier, contributing signals, latency).
5. Build automated tests simulating varied market conditions to validate tier assignments.
