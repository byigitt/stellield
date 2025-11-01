# Ethereum Solidity CCTP Bridge

A simplified Cross-Chain Transfer Protocol (CCTP) bridge implementation for Ethereum Sepolia testnet, enabling cross-chain USDC transfers.

## Features

✅ **Complete CCTP Implementation**
- TokenMessenger for burn/mint operations
- MessageTransmitter for cross-chain messaging
- MockUSDC token for testing

✅ **Production-Ready Architecture**
- Based on Circle's CCTP design
- Pausable and upgradeable patterns
- Comprehensive access control

✅ **Testnet Deployment**
- Sepolia testnet compatible
- Etherscan verification support
- Easy local testing with Hardhat

## Architecture

```
┌─────────────────┐          ┌─────────────────┐
│  Ethereum       │          │  Stellar/Solana │
│  (Sepolia)      │          │  (Testnet)      │
├─────────────────┤          ├─────────────────┤
│ TokenMessenger  │◄────────►│ Remote Bridge   │
│      ↓          │          │                 │
│ MessageTrans-   │   CCTP   │                 │
│ mitter          │◄────────►│                 │
│      ↓          │          │                 │
│ MockUSDC        │          │                 │
└─────────────────┘          └─────────────────┘
```

## Contracts

### MockUSDC.sol
- ERC20 token with 6 decimals (matching real USDC)
- Mint/burn capabilities for testing
- Faucet functionality

### MessageTransmitter.sol
- Handles cross-chain message transmission
- Nonce-based replay protection
- Attestation verification (simplified for testnet)

### TokenMessenger.sol
- Burn tokens on source chain
- Mint tokens on destination chain
- Remote TokenMessenger registry

## Setup

### Prerequisites

```bash
# Install dependencies
cd bridge
pnpm install

# Copy environment file
cp .env.example .env
```

### Configure .env

```env
ETHEREUM_RPC_URL=https://rpc.sepolia.org
ETHEREUM_PRIVATE_KEY=your-private-key-here
ETHERSCAN_API_KEY=your-etherscan-api-key
```

### Compile Contracts

```bash
pnpm compile
```

## Deployment

### Deploy to Sepolia

```bash
pnpm deploy:sepolia
```

This will:
1. Deploy MockUSDC token
2. Deploy MessageTransmitter
3. Deploy TokenMessenger
4. Fund TokenMessenger with USDC
5. Save deployment addresses to `deployments/sepolia.json`

### Verify on Etherscan

```bash
# Verify MockUSDC
npx hardhat verify --network sepolia <USDC_ADDRESS>

# Verify MessageTransmitter
npx hardhat verify --network sepolia <MESSAGE_TRANSMITTER_ADDRESS> 0

# Verify TokenMessenger
npx hardhat verify --network sepolia <TOKEN_MESSENGER_ADDRESS> <MESSAGE_TRANSMITTER_ADDRESS> <USDC_ADDRESS>
```

## Usage

### Burn USDC (Send Cross-Chain)

```typescript
import { ethers } from "ethers";

// Connect to contracts
const usdc = await ethers.getContractAt("MockUSDC", usdcAddress);
const tokenMessenger = await ethers.getContractAt("TokenMessenger", tokenMessengerAddress);

// Approve USDC
await usdc.approve(tokenMessengerAddress, amount);

// Burn and send cross-chain
const tx = await tokenMessenger.depositForBurn(
  amount,                    // Amount in USDC (6 decimals)
  destinationDomain,         // Destination domain ID
  recipientBytes32,          // Recipient address as bytes32
  usdcAddress                // Burn token address
);

const receipt = await tx.wait();
console.log("Burn TX:", receipt.hash);
```

### Mint USDC (Receive Cross-Chain)

```typescript
// Wait for attestation (in production, from Circle API)
const attestation = await getAttestation(messageHash);

// Receive message
const tx = await messageTransmitter.receiveMessage(
  messageBytes,
  attestation
);

await tx.wait();
console.log("Mint complete!");
```

## Testing

### Run Tests

```bash
pnpm test
```

### Local Network Testing

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

## Integration with Contract Folder

The bridge can be integrated with your existing contract folder:

```typescript
// In contract/src/ethereum/cctp-bridge.ts
import { ethers } from "ethers";

export class EthereumCCTPBridge {
  constructor(
    private provider: ethers.Provider,
    private signer: ethers.Signer,
    private tokenMessengerAddress: string,
    private usdcAddress: string
  ) {}

  async burnUSDC(amount: string, destinationDomain: number, recipient: string) {
    const tokenMessenger = await ethers.getContractAt(
      "TokenMessenger",
      this.tokenMessengerAddress,
      this.signer
    );

    // Convert recipient address to bytes32
    const recipientBytes32 = ethers.zeroPadValue(recipient, 32);

    // Approve and burn
    const usdc = await ethers.getContractAt("MockUSDC", this.usdcAddress, this.signer);
    await usdc.approve(this.tokenMessengerAddress, amount);

    const tx = await tokenMessenger.depositForBurn(
      amount,
      destinationDomain,
      recipientBytes32,
      this.usdcAddress
    );

    return await tx.wait();
  }
}
```

## Domain IDs

| Chain    | Domain ID |
|----------|-----------|
| Ethereum | 0         |
| Stellar  | 0         |
| Solana   | 5         |

## Contract Addresses (After Deployment)

Update these after deploying:

```
MockUSDC:            0x...
MessageTransmitter:  0x...
TokenMessenger:      0x...
```

## Key Features

### Security
- Ownable access control
- Pausable emergency stops
- Replay protection via nonces
- Token allowance patterns

### Testnet Optimizations
- Simplified attestation (vs. Circle's complex signature verification)
- MockUSDC with faucet
- Local message handling

### Production Considerations
When moving to mainnet:
1. Replace MockUSDC with real USDC contract
2. Implement Circle attestation API integration
3. Add multi-sig governance
4. Deploy on Ethereum mainnet
5. Configure real domain-to-chain mappings

## Gas Costs (Estimated on Sepolia)

| Operation        | Gas Cost |
|------------------|----------|
| Deploy All       | ~3M      |
| Burn (deposit)   | ~100K    |
| Mint (receive)   | ~80K     |
| Approve          | ~50K     |

## Troubleshooting

### Common Issues

**"Insufficient funds"**
- Ensure your wallet has Sepolia ETH
- Get testnet ETH from: https://sepoliafaucet.com

**"Invalid burn token"**
- Make sure you're using the deployed MockUSDC address
- Check USDC_ADDRESS in .env

**"Remote messenger not configured"**
- Add remote TokenMessenger addresses using `addRemoteTokenMessenger()`

## Next Steps

1. **Deploy to Sepolia**: `pnpm deploy:sepolia`
2. **Verify Contracts**: Use Etherscan verification commands
3. **Test Locally**: Run test suite
4. **Integrate**: Add to your contract folder
5. **Configure Remote**: Set up Stellar/Solana endpoints

## Resources

- [Circle CCTP Documentation](https://developers.circle.com/stablecoins/docs/cctp-getting-started)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Sepolia Testnet](https://sepolia.dev/)

## License

MIT
