# Stage 07 – Observability & QA (Apps)

1. Instrument BullMQ jobs with Prometheus metrics (latency, retries, RPC errors) and expose `/metrics` endpoint.
2. Configure alerting (Slack/webhook) for ledger lag >10 minutes, Wormhole quote failures, or model inference errors.
3. Build end-to-end tests using Playwright hitting dashboard flows against seeded testnet data.
4. Implement load tests for recommendation API using k6 or Artillery with testnet-safe payloads.
5. Establish log retention and redaction policies to avoid leaking API keys or model outputs.
