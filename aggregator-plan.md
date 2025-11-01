# Stellar Yield Aggregator Plan

## Problem Statement
- Manual vetting of Stellar-native yield opportunities does not scale and exposes operators to inconsistent risk evaluation.
- We need an automated workflow that discovers Stellar on-chain yields, filters scams, computes risk tiers, and stages capital in a managed vault strategy.

## Goals & Success Metrics
- Deliver a continuously updated Stellar yield list with explicit risk scores and explanations per opportunity.
- Produce AI-assisted portfolio recommendations that maximize risk-adjusted yield while honoring guardrails (max risk tier, liquidity limits, exposure caps).
- Provide transparent insights only—no automated fund movement—while keeping the architecture ready for future execution.
- Provide operators with visibility via the web app plus tRPC APIs for audits and downstream automation.
- Maintain real-time expectations by refreshing data every ≤10 minutes and sustain less than 1% false-negative scam rate.
- Surface Net APY vs Expected APY deltas (e.g., on-chain Net 10% vs AI projected +5% uplift) for every opportunity to explain decision rationale.

- **Stellar Source Connectors:** BullMQ-driven workers that stream data from ValidationCloud Horizon/Soroban endpoints and curated Stellar protocol APIs to collect yield offers (e.g., AMMs, savings vaults, liquidity programs).
- **Normalization Pipeline:** Transforms raw Stellar events into canonical models persisted via Prisma in `packages/db`.
- **Risk Engine:** Hybrid rule-driven + ML-assisted scoring service combining protocol heuristics, liquidity depth, validator/anchor trust, historical performance, and anomaly detection tailored to Stellar.
- **AI Portfolio Recommender:** Generates optimal yield allocations using historical performance, correlation analysis, Expected APY projections, and reinforcement algorithms; surfaces confidence scores and suggested allocation mixes along with Net vs Expected APY deltas.
- **Insight Delivery Layer:** Publishes yield opportunities, AI recommendations, and risk scores to the web UI and APIs without initiating asset transfers.
- **Bridge Reference Module:** Tracks candidate Stellar ↔ Solana bridge routes (prefer the official Soroban bridge for initial integrations) and estimates fees/latency to contextualize yields without performing moves.
- **Operator Interface:** Dashboards and controls in `apps/web` plus admin endpoints in `apps/server`/`packages/api`.
- **Observability Layer:** Metrics, logs, and alerting pipelines ensuring failures or risk drifts are surfaced quickly, with latency alerts if refresh exceeds 10 minutes.

## Data Flow
1. BullMQ schedules Stellar source jobs at ≤10-minute intervals and enqueues raw payloads for processing in `apps/server`.
2. Normalization workers enrich records with protocol metadata (anchors, issuers, LP pools) and persist canonical yield snapshots in `packages/db`.
3. Risk engine computes composite scores (A–D tiers) using liquidity, validator trust, emission stability, and incident signals; AI layer projects Expected APY.
4. Portfolio recommender compares Net APY (current on-chain) with Expected APY (projected) and produces allocation suggestions plus explanatory deltas.
5. Bridge reference module queries preferred routes (e.g., official Soroban bridge) to estimate costs and latency for hypothetical execution.
6. Insight delivery layer feeds dashboards, reports, and alerts—no funds are moved automatically.

## ValidationCloud Integration
- **Endpoint & Auth:** Use the ValidationCloud mainnet JSON-RPC endpoint (`https://mainnet.stellar.validationcloud.io/v1/<API_KEY>`) with the API key stored in server env vars; rotate via secret manager.
- **Core Methods to Call:**
  - `getLatestLedger` – fetch `sequence`, `closedAt`, `baseFee`, and `baseReserve` to confirm freshness and fee environment.
  - `getLedgerEntries` – retrieve liquidity pool snapshots, trustline balances, and Soroban contract states required for yield calculations.
  - `getEvents` / `simulateTransaction` – capture emission events, reward distributions, and contract outputs that affect APYs.
  - `getAccount` / `getOffer` – inspect issuer anchors and open offers to assess depth and counterparty risk.
- **Usage Scope:** ValidationCloud supplies read access for Stellar data; bridging, Solana protocol interactions, and AI modeling occur in our infrastructure using the retrieved datasets.
- **Data Needed per Yield Candidate:**
  - Ledger identifiers (`sequence`, `closedAt`) for timestamping snapshots.
  - Pool or contract identifiers, liquidity depth, outstanding rewards, lockup terms, and required trustlines.
  - Recent reward emission metrics (amount, asset code, frequency) pulled from Soroban events.
  - Validator or anchor metadata (home domain, auth flags) to feed the risk scorer.
- **Testing Approach:**
  - Implement a Node fetch harness (like the provided `getLatestLedgerSequenceNumber`) for each method; log raw responses and persist fixtures in a local cache for schema validation.
  - Add BullMQ job health checks that assert latest ledger lag ≤ 10 minutes by comparing `closedAt` to current time.
  - Create contract-specific probes that run against ValidationCloud staging before enabling live orchestrations.

## Risk Scoring Dimensions
- **Protocol Integrity (35%)** — Stellar anchor reputation, contract audits, exploit history, governance maturity, multisig transparency.
- **Liquidity & Execution (25%)** — Pool depth on Stellar AMMs, order book liquidity, withdrawal windows, slippage risk.
- **Performance Stability (15%)** — APY volatility, reward emission schedules, reliance on inflationary incentives.
- **Network & Custody (15%)** — Validator distribution, trustlines, compliance posture of issuers/custodians.
- **Operational Signals (10%)** — uptime, developer activity, community sentiment, incident reporting cadence.
- ML features augment each dimension with anomaly detection, clustering, and predictive failure scores; maintain override hooks for manual interventions.

- `packages/db`: New Prisma models for StellarYieldSource, StellarYieldSnapshot, RiskMetric, PortfolioRecommendation, BridgeEstimate, plus migration scripts and seed utilities.
- `packages/api`: tRPC routers for Stellar yield discovery, risk reporting, AI portfolio recommendations, and bridge cost insights, leveraging `publicProcedure` for discovery and `protectedProcedure` for admin data.
- `apps/server`: BullMQ-backed background jobs for Stellar connectors, risk scoring, ML training/inference, and bridge estimation workflows.
- `apps/web`: Operator dashboards summarizing Stellar yield tiers, AI-suggested allocations, bridge cost context, historical trends, and manual bookmarking tools with optimistic UI updates.
- `packages/auth`: Extend roles/permissions (e.g., operator, reviewer) to gate access to advanced analytics and model configuration.
## Implementation Phases
1. **Foundations:** Validate Stellar/ValidationCloud data sources, define Prisma schema, outline Stellar-specific scoring rubric, AI feature set, and bridge estimation requirements with SMEs.
2. **Connector MVP:** Implement Horizon/Soroban connectors, transformation pipeline, and persistence with mocked scoring on BullMQ cadence.
3. **Risk Engine Alpha:** Build rule engine + config, integrate historical Stellar data, calibrate weights, and expose diagnostics endpoints.
4. **Bridge Insight Integration:** Integrate official Soroban bridge (or selected provider) for cost/latency estimation and capture comparative analytics.
5. **AI Recommender Beta:** Train baseline models (e.g., gradient boosting, clustering, reinforcement) on yield snapshots, include Net vs Expected APY features, deploy inference service, and add explainability outputs.
6. **Insight Delivery UI:** Build web dashboards with interactive filtering, allocation simulations, and storytelling charts; iterate on UX with design critiques.
7. **Observability & Hardening:** Add latency metrics, bridge estimation alerts, model drift detection, backtesting harness, and chaos scenarios to measure resilience.
8. **Launch Prep:** Perform security review, finalize operator UX, document runbooks, and define rollback procedures.

## UI/UX Principles
- Emulate leading DeFi dashboards: dark theme with high-contrast highlights, responsive grid, and concise typography.
- Showcase Net vs Expected APY deltas prominently, along with risk tier badges and confidence indicators.
- Provide drill-down panels for bridge cost estimates, historical performance charts, and AI explanation snippets.
- Support watchlists, comparison tables, and quick filters (risk tier, asset, duration) for power users.
- Maintain accessibility: keyboard navigation, clear focus states, high color contrast, and descriptive tooltips.
## Open Questions & Next Steps
- Finalize list of Stellar protocols to onboard first and associated data endpoints.
- Determine caching strategy for Horizon/Soroban data to keep refresh under 10 minutes while controlling rate limits.
- Define acceptable SLAs for vault actions and emergency stop controls specific to Stellar custody flows.
- Align on compliance requirements for operating automated positions in Stellar-based programs across jurisdictions.
