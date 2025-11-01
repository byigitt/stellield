# Stellar Yield Aggregator

A proof-of-concept cross-chain yield aggregator demonstrating automated XLM → SOL → Yield → XLM flow using Soroban smart contracts.

Built for **Stellar Hackathon in Ostim**.

## 🎯 Overview

This project showcases a simulated cross-chain yield strategy:
1. Users deposit **XLM** on Stellar
2. System swaps to **SOL** (simulated)
3. Bridges to **Solana** via Wormhole (simulated)
4. Earns **yield** on Solana protocols (simulated at 5% APY)
5. Bridges back to **Stellar** (simulated)
6. Swaps back to **XLM** (simulated)
7. Users withdraw **XLM + yield**

**Example:** Deposit 100 XLM → Withdraw 110.25 XLM (10.25% profit)

## 🏗️ Architecture

### Hybrid Cross-Chain Design

**Stellar Contracts (Soroban/Rust)** - User interface & state tracking:

1. **Yield Vault** - Deposits, withdrawals, position management
2. **Mock Oracle** - Exchange rate provider (XLM/SOL)
3. **Wormhole Simulator** - Bridge event tracking

See: [`contracts/README.md`](./contracts/README.md)

**Solana Programs (Anchor/TypeScript)** - Actual yield generation:

1. **Yield Vault** - SOL deposits, yield calculation, withdrawals
2. **Wormhole Handler** - Cross-chain message verification

See: [`solana-programs/README.md`](./solana-programs/README.md)

### Backend (Coming Soon)

- **Server** (`apps/server`) - Elysia API with BullMQ job processing
- **Database** (`packages/db`) - Prisma models for positions and events
- **API** (`packages/api`) - tRPC routers for contract interaction

### Frontend (Coming Soon)

- **Web UI** (`apps/web`) - Next.js dashboard for users and admins

## 🚀 Quick Start

### 1. Deploy Smart Contracts

```bash
# Install Rust & Soroban CLI
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --locked soroban-cli

# Setup testnet
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Generate admin key and fund it
soroban keys generate admin --network testnet
curl "https://friendbot.stellar.org/?addr=$(soroban keys address admin)"

# Deploy contracts
cd contracts/scripts
export SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443
./build.sh
./deploy-all.sh
./setup-testnet.sh

# Run demo flow
./test-flow.sh
```

See: [`contracts/QUICKSTART.md`](./contracts/QUICKSTART.md)

### 2. Run Backend & Solana (Native TypeScript - No Anchor Build!)

```bash
# Install dependencies
pnpm install

# Configure environment
cp apps/server/.env.example apps/server/.env
# Add contract IDs from contracts/.env.contracts

# Test Solana native service (0 seconds build!)
cd apps/server
pnpm test:solana

# Start server
pnpm dev:server
```

**⚡ Fast Development Tip:**
Skip slow Anchor builds! Use native TypeScript for Solana operations.
See: [`ANCHOR_ALTERNATIVES.md`](./ANCHOR_ALTERNATIVES.md)

### 3. Launch Frontend (Coming Soon)

```bash
pnpm dev:web
```

## 📁 Project Structure

```
stellar-hackathon/
├── contracts/              # Stellar/Soroban (Rust) ✅
│   ├── yield-vault/       # Main vault contract
│   ├── mock-oracle/       # Price oracle
│   ├── wormhole-sim/      # Bridge event tracking
│   └── scripts/           # Deployment scripts
├── solana-programs/        # Solana/Anchor (TypeScript + Rust) 📝
│   ├── yield-vault/       # Yield generation program
│   └── wormhole-handler/  # Bridge integration
├── apps/
│   ├── server/            # Elysia API server (TODO)
│   └── web/               # Next.js frontend (TODO)
├── packages/
│   ├── api/               # tRPC routers (TODO)
│   ├── db/                # Prisma schema (TODO)
│   └── auth/              # Better Auth config
└── plan/                  # Implementation roadmap
```

## ✅ Current Status

### Completed
- ✅ Hybrid architecture designed
- ✅ Stellar contracts implemented (3 Rust/Soroban)
- ✅ Comprehensive unit tests
- ✅ Deployment scripts for Stellar testnet
- ✅ Documentation

### In Progress
- 🚧 Solana programs (2 Anchor/TypeScript)
- 🚧 Backend API implementation
- 🚧 Cross-chain orchestration
- 🚧 Database schema & migrations

### Planned
- 📋 Real Wormhole integration
- 📋 Real DEX integration for swaps
- 📋 Real Solana yield protocols (Marinade, Jito)
- 📋 Web UI dashboard
- 📋 Mainnet deployment

## 🧪 Demo

Run the full flow on testnet:

```bash
cd contracts/scripts
./test-flow.sh
```

**Output:**
```
Step 1: User deposits 100 XLM...
✅ Position created: 1

Step 2: Simulating swap to SOL (5 SOL)...
✅ Swapped to SOL

Step 3: Initiating bridge to Solana...
✅ Bridge completed

Step 4: Starting yield (2 minutes)...
✅ Yielding started
⏳ Waiting 120 seconds...

Step 5: Bridging back to Stellar...
✅ Bridge back completed

Step 6: Swapping back to XLM...
✅ Swapped back to XLM (110.25 XLM)

Step 7: User withdrawing...
✅ Withdrawn: 1102500000 stroops

Profit: 10.25 XLM (10.25%)
```

## 📊 Key Features

### For Users
- Simple deposit/withdraw interface
- Transparent position tracking
- Real-time status updates
- Profit calculations

### For Admins
- Configurable APY and timing
- Manual stage progression (for PoC)
- Exchange rate management
- Full event logging

### Technical Highlights
- Pure Rust smart contracts
- Soroban SDK best practices
- Comprehensive error handling
- Event-driven architecture
- Testnet-ready deployment

## 🛠️ Development

### Prerequisites
- Rust 1.70+
- Soroban CLI 21.x
- Node.js 18+ (for backend/frontend)
- pnpm 8+

### Build Contracts

```bash
cd contracts
cargo build --release --target wasm32-unknown-unknown
```

### Run Tests

```bash
cargo test
```

### Deploy to Testnet

See [`contracts/SETUP.md`](./contracts/SETUP.md) for detailed instructions.

## 📚 Documentation

- [Contracts Overview](./contracts/README.md)
- [Quick Start Guide](./contracts/QUICKSTART.md)
- [Setup Instructions](./contracts/SETUP.md)
- [Implementation Plan](./plan/implementation-roadmap.md)
- [Architecture Plan](./aggregator-plan.md)

## 🔐 Security Notice

⚠️ **This is a proof-of-concept for testnet only!**

- No actual fund custody
- All operations are simulated
- Not audited for production use
- Admin has full control for demo purposes

## 📄 License

MIT License - See [LICENSE](./LICENSE)

## 🤝 Contributing

This is a hackathon project. Issues and PRs welcome!

## 👥 Team

Built for Stellar Hackathon in Ostim 2025

## 🙏 Acknowledgments

- Stellar Development Foundation
- Soroban documentation and examples
- ValidationCloud for RPC infrastructure
- Wormhole protocol documentation
