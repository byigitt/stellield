# Stage 03 – Bridge Estimate Schema (Packages)

1. Introduce Prisma model `BridgeEstimate` with fields for route, feeQuote, slippage, latency, and source (`wormhole-testnet`).
2. Add repository functions (`getLatestBridgeEstimate`, `upsertBridgeEstimate`) under `packages/db`.
3. Export tRPC procedure types in `packages/api/src/routers/bridge.ts` returning estimates with freshness metadata.
4. Ensure API sanitizes fields to avoid exposing sensitive Wormhole credentials.
5. Write integration tests with mocked data verifying bridge router responses.
