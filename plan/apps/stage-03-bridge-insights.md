# Stage 03 – Bridge Insight Layer (Apps)

1. Integrate Wormhole **testnet** SDK to request Stellar↔Solana route estimates (fees, confirmations, latency) without executing transfers.
2. Implement `bridge-estimate.job.ts` refreshing quotes for priority asset pairs every 30 minutes.
3. Cache results in Redis and persist summary records via packages/db `BridgeEstimate` model.
4. Expose health metrics for quote freshness and Wormhole RPC availability.
5. Provide developer CLI script to manually refresh quotes for QA sessions.
