# CCTP Message Hash Fix - Circle Attestation API

## The Problem

When you tested the Circle attestation API with:
```bash
curl https://iris-api-sandbox.circle.com/attestations/fb4715920c5c7eca78b67201e7a4e67463feea6d38825ee27d9987f582a59105
```

You received:
```json
{"error":"Message hash not found"}
```

## Root Cause

The message hash **must be the keccak256 hash of the actual message bytes** emitted by the CCTP `MessageSent` event. Your code was generating a custom placeholder hash instead of extracting the real one from the transaction.

### How Circle CCTP Works

1. **Burn Transaction**: When you call `depositForBurn` on the CCTP TokenMessenger contract, it emits a `MessageSent` event
2. **Message Bytes**: This event contains the raw message bytes that encode all the transfer details
3. **Message Hash**: The message hash is `keccak256(messageBytes)` - NOT a custom generated hash
4. **Attestation**: Circle's attestation service watches for these events and signs attestations for the message hash
5. **Query**: You query Circle's API with the message hash to get the signed attestation

## The Fix

I've created a proper message hash extraction system:

### 1. Message Hash Extractor (`src/bridge/message-hash-extractor.ts`)

```typescript
import { keccak256 } from 'js-sha3';

export class MessageHashExtractor {
  /**
   * Calculate the message hash from message bytes using keccak256
   * This is the same hash that Circle's attestation service expects
   */
  calculateMessageHash(messageBytes: string): string {
    const cleanHex = messageBytes.startsWith('0x') 
      ? messageBytes.slice(2) 
      : messageBytes;
    
    const buffer = Buffer.from(cleanHex, 'hex');
    const hash = keccak256(buffer);
    
    return hash; // Returns hex string without 0x prefix
  }
  
  /**
   * Extract message hash from transaction logs/events
   */
  extractMessageHash(txData: any): string | null {
    // Finds MessageSent event and calculates hash
  }
}
```

### 2. Updated Stellar CCTP Burn

Added a new method to extract message hash from actual transactions:

```typescript
async extractMessageHashFromTx(txHash: string): Promise<string | null> {
  const tx = await this.client.getTransaction(txHash);
  const messageHash = messageHashExtractor.extractMessageHash(tx);
  return messageHash;
}
```

## How to Use

### For Real CCTP Transactions

If you have an actual CCTP burn transaction:

```typescript
import { StellarCCTPBurn } from './stellar/cctp-burn';
import { messageHashExtractor } from './bridge/message-hash-extractor';

// After performing a burn transaction
const burnResult = await cctpBurn.burnUSDC(amount, destinationDomain, recipient);

// Extract the real message hash from the transaction
const realMessageHash = await cctpBurn.extractMessageHashFromTx(
  burnResult.transactionHash
);

// Use this hash to query Circle's attestation API
const attestation = await attestationService.getAttestation(realMessageHash);
```

### If You Have Message Bytes Directly

```typescript
// If you already have the message bytes from the MessageSent event
const messageBytes = "0x000000000000000..."; // Full message hex
const messageHash = messageHashExtractor.calculateMessageHash(messageBytes);

// Query Circle's API
const url = `https://iris-api-sandbox.circle.com/attestations/${messageHash}`;
```

## Testing with Real Transactions

To get a valid message hash for testing:

1. **Perform an actual CCTP burn** on testnet/devnet
2. **Get the transaction hash** 
3. **Query the transaction** to get the events
4. **Extract the MessageSent event** and its message bytes
5. **Calculate keccak256** of those bytes
6. **Use that hash** to query Circle's API

## Example: Getting Message Bytes from EVM Chains

For EVM-compatible chains (Ethereum, Avalanche, etc.):

```typescript
// Get transaction receipt
const receipt = await provider.getTransactionReceipt(txHash);

// Find MessageSent event (topic[0] signature)
const MESSAGE_SENT_SIGNATURE = '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036';

const messageSentLog = receipt.logs.find(
  log => log.topics[0] === MESSAGE_SENT_SIGNATURE
);

// Decode the event data to get message bytes
const messageBytes = messageSentLog.data; // This contains the message

// Calculate the hash
const messageHash = keccak256(Buffer.from(messageBytes.slice(2), 'hex'));
```

## For Stellar/Soroban

For Stellar CCTP (when it becomes available):

```typescript
// Get transaction from Horizon/Soroban RPC
const tx = await horizon.transactions().transaction(txHash).call();

// Parse the contract events
const events = parseContractEvents(tx.result_meta_xdr);

// Find MessageSent event
const messageSentEvent = events.find(e => e.type === 'MessageSent');

// Extract message bytes
const messageBytes = messageSentEvent.data.message;

// Calculate hash
const messageHash = keccak256(Buffer.from(messageBytes, 'hex'));
```

## Current Limitation

The code currently uses **placeholder hashes** because:
- CCTP contracts might not be fully deployed on Stellar testnet yet
- You're testing the flow without actual CCTP transactions
- The `CCTP_MOCK_MODE=true` environment variable bypasses real attestations

## Next Steps

1. **Deploy/Use Real CCTP Contracts**: Use actual CCTP TokenMessenger contracts
2. **Parse Real Events**: Implement full event parsing for your blockchain
3. **Test with Real Transactions**: Perform actual burns and extract message hashes
4. **Verify with Circle**: Confirm your message hash matches what Circle expects

## Testing the Current Implementation

You can test the keccak256 calculation:

```typescript
import { messageHashExtractor } from './src/bridge/message-hash-extractor';

// Example message bytes (this is dummy data)
const messageBytes = "0x0000000000000001000000000000000500000000000000000000000000000000";

const hash = messageHashExtractor.calculateMessageHash(messageBytes);
console.log('Message hash:', hash);

// Verify it's valid format
console.log('Is valid:', messageHashExtractor.isValidMessageHash(hash));
```

## References

- [Circle CCTP API Documentation](https://developers.circle.com/api-reference/cctp/all/get-attestation)
- [Circle CCTP Getting Started](https://developers.circle.com/stablecoins/docs/cctp-getting-started)
- [CCTP EVM Contracts](https://developers.circle.com/cctp/evm-smart-contracts)

## Summary

**The key fix**: Use `keccak256(messageBytes)` from the actual `MessageSent` event, not a custom generated hash. The message hash you provided (`fb471592...`) appears to be from a real transaction, but your code wasn't extracting it properly from the transaction events.
