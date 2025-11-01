# CCTP Migration Guide

## Overview

This document describes the migration from **Wormhole** to **Circle's CCTP (Cross-Chain Transfer Protocol)** for enabling Scenario A with profitable cross-chain yield aggregation.

## Why CCTP?

### Problem with Wormhole
- **High bridge costs**: $1-$4 per round trip (VAA attestation + relayer fees)
- **Complex integration**: Guardian network, VAA verification, multi-step process
- **Wrapped tokens**: Creates synthetic assets, not native USDC
- **Profitability issue**: Bridge fees consume all yield in Scenario A

### CCTP Advantages
- ✅ **≈$0 bridge cost**: Only gas fees (~$0.10 testnet, ~$0.01 mainnet)
- ✅ **Native USDC**: Burn & mint mechanism preserves token nativity
- ✅ **Simpler integration**: Circle Bridge Kit SDK with 10 lines of code
- ✅ **Circle-backed**: Regulated, audited, institutional-grade
- ✅ **Faster adoption**: Growing support across major chains

## Scenario A Economics

### Without CCTP (Wormhole)
```
Initial: 10,000₺ XLM
├─ XLM → USDC (Stellar AMM, -0.3%): 9,970₺
├─ Wormhole Stellar → Solana (~$2): 9,910₺  ❌
├─ USDC lending 60d @6% APY: 10,008₺
├─ Wormhole Solana → Stellar (~$2): 9,948₺  ❌
└─ USDC → XLM (Stellar AMM, -0.3%): 9,918₺

Net Result: -82₺ LOSS ❌
```

### With CCTP ✅
```
Initial: 10,000₺ XLM
├─ XLM → USDC (Stellar AMM, -0.3%): 9,970₺
├─ CCTP Stellar → Solana (≈$0): 9,970₺  ✅
├─ USDC lending 60d @6% APY: 10,065.96₺
├─ CCTP Solana → Stellar (≈$0): 10,065.96₺  ✅
└─ USDC → XLM (Stellar AMM, -0.3%): 10,035.76₺

Net Result: +35.76₺ PROFIT (0.36%) ✅
```

## Architecture Changes

### Before (Wormhole)

```
Stellar                      Solana
─────────                    ──────────
wormhole-sim contract    →   wormhole-handler program
  (VAA generation)              (VAA verification)
  (Bridge simulation)           (CPI to yield-vault)
```

### After (CCTP)

```
Stellar                      Solana
─────────                    ──────────
CCTP TokenMessenger      →   CCTP TokenMinter
  (USDC burn)                  (USDC mint)
  (Circle attestation)         (Circle verification)

Backend Orchestration
─────────────────────
apps/server/services/
  ├─ cctp-bridge.service.ts     (Bridge Kit integration)
  └─ yield-orchestrator.service.ts (Full Scenario A flow)
```

## Implementation

### 1. Dependencies Installed

```bash
cd apps/server
pnpm add @circle-fin/bridge-kit @circle-fin/adapter-viem-v2 @circle-fin/adapter-solana @solana/web3.js @solana/spl-token viem
```

### 2. Services Created

#### `cctp-bridge.service.ts`
- Bridge Kit integration
- Stellar ↔ Solana USDC transfers
- Cost estimation (≈$0 bridge fees)
- Transaction status tracking

#### `yield-orchestrator.service.ts`
- Full Scenario A orchestration
- 6-step flow automation:
  1. XLM → USDC swap
  2. CCTP bridge to Solana
  3. USDC lending (yield accrual)
  4. CCTP bridge to Stellar
  5. USDC → XLM swap
  6. Position completion

### 3. Configuration

Add to `apps/server/.env`:

```env
# CCTP Bridge Configuration
STELLAR_PRIVATE_KEY=<your-stellar-private-key>
SOLANA_PRIVATE_KEY=<your-solana-private-key-base58>
NETWORK=testnet

# Stellar Network
STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Solana Network
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### 4. Testing

Run Scenario A test:

```bash
cd apps/server
pnpm tsx src/test-scenario-a.ts
```

Expected output:
```
🚀 Starting Scenario A Test

📋 Supported Bridge Routes:
  - Stellar → Solana: $0.00 (~5 min)
  - Solana → Stellar: $0.00 (~5 min)

💰 Estimating Bridge Costs:
  Bridge Fee: $0.00 (CCTP burn & mint)
  Gas Fee: $0.10 (network fees)
  Total Cost: $0.10

🎯 Executing Scenario A:

========== SCENARIO A EXECUTION ==========
User: test-user-001
Initial XLM: 10000.00
APY: 6%
Duration: 60 days
==========================================

[Yield Orchestrator] Swapped 10000.00 XLM → 9970.00 USDC (fee: 30.00 XLM)
[CCTP Bridge] Starting stellar-to-solana transfer of 9970.00 USDC
[CCTP Bridge] Transfer successful: {...}
[Yield Orchestrator] Yield calculation: 9970.00 USDC @ 6% APY for 60 days = 10065.96 USDC
[CCTP Bridge] Starting solana-to-stellar transfer of 10065.96 USDC
[CCTP Bridge] Transfer successful: {...}
[Yield Orchestrator] Swapped 10065.96 USDC → 10035.76 XLM (fee: 30.20 USDC)

========== SCENARIO A RESULTS ==========
Initial: 10000.00 XLM
Final: 10035.76 XLM
Profit: 35.76 XLM (0.36%)
=========================================

✅ PASS: Profit matches expected Scenario A calculation!
```

## Migration Steps

### Phase 1: Backend Services ✅
- [x] Install CCTP SDK
- [x] Create `cctp-bridge.service.ts`
- [x] Create `yield-orchestrator.service.ts`
- [x] Create test script

### Phase 2: API Integration
- [ ] Add tRPC procedures for CCTP bridge
- [ ] Update `packages/api` routers
- [ ] Add Prisma models for positions

### Phase 3: Frontend Updates
- [ ] Update `bridge-insights.tsx` with CCTP routes
- [ ] Show $0 bridge fees
- [ ] Add Scenario A calculator widget

### Phase 4: Smart Contracts
- [ ] Keep Solana `yield-vault` program (USDC lending)
- [ ] Remove `wormhole-sim` Stellar contract
- [ ] Remove `wormhole-handler` Solana program
- [ ] Add CCTP integration to Stellar contracts

### Phase 5: Documentation
- [ ] Update README with CCTP info
- [ ] Create deployment guide
- [ ] Add troubleshooting section

## Key Differences: CCTP vs Wormhole

| Feature | Wormhole | CCTP |
|---------|----------|------|
| **Bridge Cost** | $1-$4 | ~$0 |
| **Token Type** | Wrapped (synthetic) | Native USDC |
| **Complexity** | High (VAA, Guardians) | Low (SDK) |
| **Speed** | ~3-5 min | ~5-10 min |
| **Security Model** | Guardian network | Circle attestation |
| **Supported Assets** | Any token | USDC only |
| **Integration** | Custom VAA handling | Bridge Kit SDK |
| **Code Lines** | ~200+ | ~10 |

## CCTP Supported Chains

### Testnet
- Ethereum Sepolia
- Solana Devnet
- Arbitrum Sepolia
- Base Sepolia
- Optimism Sepolia
- Polygon Mumbai
- Avalanche Fuji

### Mainnet
- Ethereum
- Solana
- Arbitrum
- Base
- Optimism
- Polygon
- Avalanche

## Important Notes

### CCTP Limitations
1. **USDC Only**: CCTP transfers only native USDC
   - Must swap XLM → USDC first
   - No direct XLM bridging

2. **Circle Attestation**: Requires Circle's service
   - ~5-10 minute finality
   - Dependency on Circle infrastructure

3. **Gas Fees**: Users pay gas on both chains
   - Source chain: burn transaction
   - Destination chain: mint transaction

### Security Considerations

1. **Private Keys**: Never commit `.env` files
2. **Testnet First**: Always test on testnet
3. **Circle Dependency**: Bridge relies on Circle's attestation service
4. **Smart Contract Audits**: Ensure all contracts are audited

## Troubleshooting

### "Bridge adapters not initialized"
- Check `STELLAR_PRIVATE_KEY` and `SOLANA_PRIVATE_KEY` in `.env`
- Ensure keys are in correct format (hex for Stellar, base58 for Solana)

### "Transfer failed"
- Verify wallet has sufficient USDC
- Check gas token balance (ETH for Stellar testnet, SOL for Solana)
- Confirm network is `testnet` in `.env`

### "Circle attestation timeout"
- Circle's attestation can take 5-10 minutes
- Check Circle status page: https://status.circle.com
- Retry with Bridge Kit's retry capabilities

## Resources

- [Circle CCTP Docs](https://developers.circle.com/cctp)
- [Bridge Kit Quickstart](https://developers.circle.com/bridge-kit/quickstarts/transfer-usdc-from-ethereum-to-solana)
- [CCTP FAQ](https://developers.circle.com/cctp/cctp-faq)
- [Circle Testnet Faucet](https://faucet.circle.com/)

## Next Steps

1. **Test on Testnet**: Run full Scenario A flow with real wallets
2. **API Integration**: Add tRPC endpoints for frontend
3. **UI Updates**: Show CCTP routes in bridge insights
4. **Smart Contracts**: Remove Wormhole, add CCTP
5. **Monitoring**: Add Circle attestation health checks
6. **Production**: Deploy to mainnet with audited contracts

---

**Migration Status**: ✅ Phase 1 Complete (Backend Services)

**Estimated Completion**: 3-5 days remaining for full integration
