# Stage 00 – Foundation & Environment (Testnet PoC)

1. Request ValidationCloud Stellar **testnet** JSON-RPC key and set `VC_STELLAR_RPC_URL` / `VC_STELLAR_API_KEY` in `.env.test`.
2. Spin up local Redis instance (Docker or container app) and record connection string for BullMQ queues.
3. Run `pnpm install` at repo root; verify `pnpm lint` and `pnpm check-types` succeed.
4. Duplicate `.env.example` files into `.env.test` for each workspace; populate shared keys, leaving production secrets blank.
5. Document team access to ValidationCloud dashboard and Wormhole testnet faucet for future integrations.
