# Stellar-Solana Cross-Chain Yield Aggregator

A TypeScript-based PoC that enables cross-chain yield generation by bridging assets between Stellar and Solana using Circle's CCTP (Cross-Chain Transfer Protocol).

## Overview

This project demonstrates a complete cross-chain yield strategy:

1. **Deposit Flow**: XLM → USDC (Stellar) → Bridge (CCTP) → Solana → Stake (Marinade)
2. **Withdrawal Flow**: Unstake (Marinade) → Solana → Bridge (CCTP) → USDC → XLM (Stellar)

## Features

- ✅ Stellar wallet management and transactions
- ✅ XLM to USDC swapping via Mercury Protocol
- ✅ Cross-chain USDC bridging (CCTP-ready architecture - see [CCTP-STATUS.md](./CCTP-STATUS.md))
- ✅ Solana wallet management and transactions
- ✅ Liquid staking on Marinade Finance (mSOL)
- ✅ Complete orchestration of deposit and withdrawal flows
- ✅ Comprehensive error handling and transaction state tracking

## Prerequisites

- Node.js >= 18.x
- pnpm (recommended) or npm
- Stellar testnet account with XLM
- Solana devnet account with SOL
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

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=YOUR_SOLANA_BASE58_PRIVATE_KEY

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
├── solana/           # Solana blockchain integration
│   ├── client.ts     # Solana SDK wrapper
│   ├── cctp-mint.ts  # CCTP mint operations
│   └── marinade.ts   # Marinade Finance staking
├── bridge/           # Cross-chain bridge utilities
│   ├── attestation.ts # Circle attestation service
│   └── types.ts      # Bridge message types
├── orchestrator/     # Flow orchestration
│   ├── deposit.ts    # Deposit flow
│   ├── withdraw.ts   # Withdrawal flow
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
5. USDC is minted on Solana using the attestation
6. USDC is staked with Marinade Finance to receive mSOL
7. User earns yield through Marinade's liquid staking

### Withdrawal Flow

1. User initiates withdrawal
2. mSOL is unstaked from Marinade to USDC
3. USDC is burned on Solana via CCTP
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
- **Solana Web3.js**: Blockchain interaction for Solana
- **Circle CCTP**: Cross-chain USDC transfers
- **Marinade Finance SDK**: Liquid staking on Solana
- **Mercury Protocol**: DEX for XLM/USDC swaps
- **TypeScript**: Type-safe development

## License

ISC

## Contributing

This is a PoC project. Feel free to fork and experiment!

