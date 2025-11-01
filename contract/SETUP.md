# Setup Guide

This guide will help you set up and run the Stellar-Solana Cross-Chain Yield Aggregator PoC.

## Prerequisites

- Node.js >= 18.x
- pnpm (recommended) or npm
- Stellar testnet account
- Solana devnet account

## Installation

1. **Clone and install dependencies:**

```bash
# Install dependencies
pnpm install
```

2. **Create environment configuration:**

```bash
# Copy the example environment file
cp .env.example .env
```

3. **Configure your environment:**

Edit `.env` and add your keys and configuration:

```env
# Stellar Configuration
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_PRIVATE_KEY=YOUR_STELLAR_SECRET_KEY_HERE

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=YOUR_SOLANA_BASE58_PRIVATE_KEY_HERE

# Other configuration...
```

## Getting Test Accounts

### Stellar Testnet Account

1. Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Click "Generate keypair"
3. Click "Get test network lumens" to fund your account
4. Copy your **Secret Key** to `.env` as `STELLAR_PRIVATE_KEY`

### Solana Devnet Account

**Option 1: Using Solana CLI**

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate a keypair
solana-keygen new --outfile ~/my-solana-wallet.json

# Get your private key in base58
solana-keygen pubkey ~/my-solana-wallet.json

# Request airdrop
solana airdrop 2 YOUR_PUBLIC_KEY --url devnet
```

**Option 2: Using Web Faucet**

1. Generate a keypair using a tool like [Solana Keygen Online](https://solanakeygen.com/)
2. Get devnet SOL from [Solana Faucet](https://faucet.solana.com/)
3. Copy your base58-encoded private key to `.env` as `SOLANA_PRIVATE_KEY`

## Verification

Check that your accounts are properly set up:

```bash
pnpm example:balances
```

This will display:
- Stellar account balances (XLM, USDC)
- Solana account balances (SOL, USDC, mSOL)
- Marinade Finance information

## Running Examples

### Check Balances

```bash
pnpm example:balances
```

### Deposit Flow (XLM → USDC → Bridge → Stake)

```bash
pnpm example:deposit
```

This will:
1. Swap XLM to USDC on Stellar
2. Burn USDC on Stellar (CCTP)
3. Get attestation from Circle
4. Mint USDC on Solana
5. Stake with Marinade Finance

### Withdrawal Flow (Unstake → Bridge → Swap → XLM)

```bash
pnpm example:withdraw
```

This will:
1. Unstake mSOL from Marinade
2. Burn USDC on Solana (CCTP)
3. Get attestation from Circle
4. Mint USDC on Stellar
5. Swap USDC back to XLM

## Build for Production

```bash
# Compile TypeScript
pnpm build

# Run compiled code
pnpm start
```

## Project Structure

```
stellar-smart-contract-test/
├── src/
│   ├── stellar/          # Stellar blockchain integration
│   ├── solana/           # Solana blockchain integration
│   ├── bridge/           # CCTP bridge utilities
│   ├── orchestrator/     # Flow orchestration
│   ├── config/           # Configuration management
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── examples/             # Example scripts
├── .env.example          # Example environment configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Troubleshooting

### "Failed to load Stellar account"

- Verify your `STELLAR_PRIVATE_KEY` in `.env`
- Ensure your account has been funded with test lumens
- Check you're using the correct network (testnet)

### "Invalid Solana private key format"

- Ensure your `SOLANA_PRIVATE_KEY` is base58-encoded
- Don't include brackets or quotes in the key
- The key should be a single long string

### "Insufficient balance"

- Request more test tokens:
  - Stellar: Use the [Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
  - Solana: Use the [Faucet](https://faucet.solana.com/)

### CCTP Integration Issues

- Note: Full CCTP integration requires actual contract deployments
- This PoC includes placeholder implementations for CCTP operations
- For production use, integrate with actual CCTP contracts on both chains

## Important Notes

⚠️ **This is a PoC (Proof of Concept)**

- Only for testnet/devnet use
- CCTP operations use placeholder implementations
- Not audited or production-ready
- Never use mainnet private keys

## Next Steps

1. Test the deposit flow with small amounts
2. Wait for yield accumulation (Marinade APY ~6-7%)
3. Test the withdrawal flow
4. Integrate with your existing backend
5. Add proper error handling and retry logic
6. Implement full CCTP contract integration
7. Add monitoring and alerting
8. Perform security audit before mainnet

## Support

For issues or questions:
- Check the logs (set `LOG_LEVEL=DEBUG` in `.env`)
- Review the example scripts in `examples/`
- Refer to the documentation in README.md

## Additional Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Solana Documentation](https://docs.solana.com/)
- [Circle CCTP Documentation](https://developers.circle.com/stablecoins/docs/cctp-getting-started)
- [Marinade Finance](https://marinade.finance/)
- [Mercury Protocol](https://mercuryprotocol.io/)

