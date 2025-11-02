# Bridge · Circle CCTP Toolkit

Implements a Sepolia-compatible version of Circle's Cross-Chain Transfer Protocol (CCTP) for USDC bridging.

## Includes
- `contracts/` with MockUSDC, MessageTransmitter, TokenMessenger
- Hardhat deployment & verification scripts
- Environment template for RPC/keys (`.env.example`)

## Develop
```bash
pnpm install         # install deps
pnpm compile         # hardhat compile
pnpm test            # run unit tests
```

## Deploy to Sepolia
```bash
pnpm deploy:sepolia
```
Stores addresses in `deployments/sepolia.json`. Follow up with `npx hardhat verify ...` for Etherscan verification.
