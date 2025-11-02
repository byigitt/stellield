# Stellar-Ethereum Cross-Chain Yield Aggregator

A TypeScript-based PoC that enables cross-chain yield generation by bridging assets between Stellar and Ethereum using Circle's CCTP (Cross-Chain Transfer Protocol).

## Overview

This project demonstrates a complete cross-chain yield strategy:

1. **Deposit Flow**: XLM → USDC (Stellar) → Bridge (CCTP) → Ethereum → Supply to Aave (aUSDC)
2. **Withdrawal Flow**: Withdraw from Aave → Ethereum → Bridge (CCTP) → USDC → XLM (Stellar)

## Features

- ✅ Stellar wallet management and transactions
- ✅ XLM to USDC swapping via Mercury Protocol
- ✅ Cross-chain USDC bridging (CCTP-ready architecture - see [CCTP-STATUS.md](./CCTP-STATUS.md))
- ✅ Ethereum wallet management and transactions
- ✅ Yield generation on Aave Protocol (aUSDC)
- ✅ Complete orchestration of deposit and withdrawal flows
- ✅ Comprehensive error handling and transaction state tracking

## Prerequisites

- Node.js >= 18.x
- pnpm (recommended) or npm
- Stellar testnet account with XLM
- Ethereum Sepolia testnet account with ETH
- Basic understanding of blockchain transactions

## Installation

```bash
# Clone the repository
git clone https://github.com/byigitt/soullar
cd soullar

# Install dependencies
pnpm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your keys and configuration
```

## Configuration

Update `.env` with your configuration:

```env
# Stellar Configuration
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_PRIVATE_KEY=YOUR_STELLAR_SECRET_KEY

# Ethereum Configuration
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHEREUM_CHAIN_ID=11155111
ETHEREUM_PRIVATE_KEY=YOUR_ETHEREUM_PRIVATE_KEY

# Additional configuration...
```

## Usage

### Build the project

```bash
pnpm build
```

### Run deposit example

```bash
pnpm example:deposit
```

### Run withdrawal example

```bash
pnpm example:withdraw
```

## Project Structure

```
src/
├── stellar/          # Stellar blockchain integration
│   ├── client.ts     # Stellar SDK wrapper
│   ├── swap.ts       # Mercury Protocol DEX integration
│   └── cctp-burn.ts  # CCTP burn operations
├── ethereum/         # Ethereum blockchain integration
│   ├── client.ts     # Ethereum SDK wrapper
│   └── aave.ts       # Aave Protocol yield integration
├── bridge/           # Cross-chain bridge utilities
│   ├── attestation.ts # Circle attestation service
│   └── types.ts      # Bridge message types
├── orchestrator/     # Flow orchestration
│   ├── stellar-to-eth.ts # Deposit flow
│   ├── eth-yield.ts  # Yield flow
│   └── state.ts      # Transaction state management
├── config/           # Configuration management
├── types/            # Shared TypeScript types
└── utils/            # Utility functions
```

## How It Works

### Deposit Flow

1. User deposits XLM on Stellar
2. XLM is swapped to USDC using Mercury Protocol
3. USDC is burned on Stellar via CCTP
4. Circle provides attestation for the burn
5. USDC is minted on Ethereum using the attestation
6. USDC is supplied to Aave Protocol to receive aUSDC
7. User earns yield through Aave's lending protocol

### Withdrawal Flow

1. User initiates withdrawal
2. aUSDC is withdrawn from Aave to USDC (with earned yield)
3. USDC is burned on Ethereum via CCTP
4. Circle provides attestation for the burn
5. USDC is minted on Stellar using the attestation
6. USDC is swapped back to XLM
7. XLM is returned to user (with yield gains)

## Development

```bash
# Run in development mode
pnpm dev

# Build for production
pnpm build

# Start production build
pnpm start
```

## Security Notes

⚠️ **This is a PoC (Proof of Concept) for testnet/devnet only**

- Never use mainnet private keys in this code
- Store private keys securely (use hardware wallets for production)
- Review all transactions before signing
- Test thoroughly on testnet before any mainnet deployment

## Technologies Used

- **Stellar SDK**: Blockchain interaction for Stellar
- **Ethers.js/Viem**: Blockchain interaction for Ethereum
- **Circle CCTP**: Cross-chain USDC transfers
- **Aave Protocol**: Decentralized lending and yield generation
- **Mercury Protocol**: DEX for XLM/USDC swaps
- **TypeScript**: Type-safe development

## License

ISC

## Contributing

This is a PoC project. Feel free to fork and experiment!

