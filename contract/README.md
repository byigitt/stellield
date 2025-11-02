# Contract · Soroban Orchestrator

TypeScript toolkit coordinating the cross-chain yield flow between Stellar, Circle CCTP, and Ethereum/Solana targets.

## Highlights
- Soroban client helpers for deposit/withdraw flows
- Mercury swap + Circle attestation simulators
- Scripts under `scripts/` for build/deploy/test

## Quick Start
```bash
pnpm install           # root install
cd contract
pnpm dev               # run orchestrator in watch mode
```

### Soroban Toolchain
```bash
cd scripts
./build.sh
./deploy-all.sh
./test-flow.sh
```
Follow `SETUP.md` for network configuration and environment variables.
