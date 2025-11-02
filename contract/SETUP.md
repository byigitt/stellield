# Setup Guide

This guide will help you set up and run the Stellar-Ethereum Cross-Chain Yield Aggregator PoC.

## Prerequisites

- Node.js >= 18.x
- pnpm (recommended) or npm
- Stellar testnet account
- Ethereum Sepolia testnet account

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

# Ethereum Configuration
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHEREUM_CHAIN_ID=11155111
ETHEREUM_PRIVATE_KEY=YOUR_ETHEREUM_PRIVATE_KEY_HERE

# Other configuration...
```

## Getting Test Accounts

### Stellar Testnet Account

1. Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Click "Generate keypair"
3. Click "Get test network lumens" to fund your account
4. Copy your **Secret Key** to `.env` as `STELLAR_PRIVATE_KEY`

### Ethereum Sepolia Account

**Option 1: Using MetaMask**

1. Install [MetaMask](https://metamask.io/) browser extension
2. Create a new wallet or import an existing one
3. Switch to Sepolia testnet in MetaMask (Settings → Networks → Show test networks)
4. Export your private key:
   - Click on the three dots → Account details → Export Private Key
   - Copy your private key to `.env` as `ETHEREUM_PRIVATE_KEY`
5. Get Sepolia ETH from faucets:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
6. Get Sepolia USDC (if available) or bridge from other testnets

**Option 2: Using Hardhat/Node**

```bash
# Generate a new Ethereum wallet using Node.js
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
```

Then fund it using the faucets above.

## Verification

Check that your accounts are properly set up:

```bash
pnpm example:balances
```

This will display:
- Stellar account balances (XLM, USDC)
- Ethereum account balances (ETH, USDC, aUSDC)
- Aave Protocol information

## Running Examples

### Check Balances

```bash
pnpm example:balances
```

### Deposit Flow (XLM → USDC → Bridge → Supply to Aave)

```bash
pnpm example:deposit
```

This will:
1. Swap XLM to USDC on Stellar
2. Burn USDC on Stellar (CCTP)
3. Get attestation from Circle
4. Mint USDC on Ethereum
5. Supply USDC to Aave Protocol (receive aUSDC)

### Withdrawal Flow (Withdraw from Aave → Bridge → Swap → XLM)

```bash
pnpm example:withdraw
```

This will:
1. Withdraw USDC from Aave (with earned yield)
2. Burn USDC on Ethereum (CCTP)
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
│   ├── ethereum/         # Ethereum blockchain integration
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

### "Invalid Ethereum private key format"

- Ensure your `ETHEREUM_PRIVATE_KEY` starts with `0x`
- Don't include extra quotes or whitespace
- The key should be 66 characters (including `0x` prefix)

### "Insufficient balance"

- Request more test tokens:
  - Stellar: Use the [Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
  - Ethereum: Use [Alchemy Faucet](https://sepoliafaucet.com/) or [Infura Faucet](https://www.infura.io/faucet/sepolia)

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
2. Wait for yield accumulation (Aave APY varies by market conditions)
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
- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- [Circle CCTP Documentation](https://developers.circle.com/stablecoins/docs/cctp-getting-started)
- [Aave Protocol Documentation](https://docs.aave.com/)
- [Mercury Protocol](https://mercuryprotocol.io/)

