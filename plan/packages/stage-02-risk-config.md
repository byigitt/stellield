# Stage 02 – Risk Configuration (Packages)

1. Create `packages/api/src/config/risk.ts` defining weighting schema and tier thresholds (A–D) for PoC.
2. Add Zod schemas for risk metric inputs/outputs to ensure strict typing across consumers.
3. Export helper `calculateRiskScore(inputs)` used by server risk module.
4. Document override mechanism (per-asset weight adjustments) stored in DB table `RiskOverride`.
5. Provide unit tests validating risk calculations and serialization.
