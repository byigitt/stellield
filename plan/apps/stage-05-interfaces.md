# Stage 05 – API & Contract Interfaces (Apps)

1. Wire new tRPC routers in server (`yield`, `risk`, `recommend`, `bridge`) delegating to service modules.
2. Generate client typing with existing `@/utils/trpc` factory for web consumption.
3. Draft Soroban smart contract stubs (custody placeholders) deployed to testnet for future execution phases.
4. Implement RPC integration tests verifying ValidationCloud testnet endpoints handle contract queries.
5. Document deployment scripts for Soroban stubs using `soroban-cli` connected via ValidationCloud.
