/**
 * Utility script to extract message hash from a CCTP transaction
 * Usage: ts-node scripts/extract-message-hash.ts <transaction-hash>
 */

import { messageHashExtractor } from '../src/bridge/message-hash-extractor';
import axios from 'axios';

async function extractMessageHash(txHash: string, blockchain: 'stellar' | 'ethereum' | 'avalanche' = 'stellar') {
  console.log('🔍 Extracting message hash from transaction:', txHash);
  console.log('Blockchain:', blockchain);
  
  try {
    let txData;
    
    if (blockchain === 'stellar') {
      // Fetch from Stellar Horizon
      const response = await axios.get(
        `https://horizon-testnet.stellar.org/transactions/${txHash}`
      );
      txData = response.data;
    } else if (blockchain === 'ethereum') {
      // For Ethereum/Avalanche, you'd use an RPC provider
      // This is a placeholder
      console.log('⚠️  Ethereum/Avalanche extraction not yet implemented');
      console.log('Please use an Ethereum provider to get transaction receipt');
      return;
    }
    
    console.log('\n📦 Transaction data retrieved');
    
    // Try to extract message hash
    const messageHash = messageHashExtractor.extractMessageHash(txData);
    
    if (messageHash) {
      console.log('\n✅ Message hash extracted successfully!');
      console.log('Message hash:', messageHash);
      console.log('\n🔗 Test with Circle Attestation API:');
      console.log(`curl https://iris-api-sandbox.circle.com/attestations/${messageHash}`);
      
      // Verify it's valid format
      const isValid = messageHashExtractor.isValidMessageHash(messageHash);
      console.log('Valid format:', isValid ? '✅' : '❌');
      
      // Try to fetch attestation
      console.log('\n🔄 Checking Circle attestation status...');
      try {
        const attestationResponse = await axios.get(
          `https://iris-api-sandbox.circle.com/attestations/${messageHash}`
        );
        console.log('✅ Attestation response:', JSON.stringify(attestationResponse.data, null, 2));
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log('⏳ Attestation not yet available (this is normal - Circle takes 10-20 minutes)');
        } else {
          console.log('❌ Error fetching attestation:', error.message);
        }
      }
    } else {
      console.log('\n❌ Failed to extract message hash');
      console.log('This transaction may not contain a CCTP MessageSent event');
      console.log('\nPossible reasons:');
      console.log('1. Not a CCTP burn transaction');
      console.log('2. Transaction format not yet supported');
      console.log('3. MessageSent event parsing needs to be implemented for this chain');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Manual message hash calculation from message bytes
async function calculateMessageHashFromBytes(messageBytes: string) {
  console.log('🔢 Calculating message hash from message bytes');
  console.log('Input:', messageBytes);
  
  const hash = messageHashExtractor.calculateMessageHash(messageBytes);
  
  console.log('\n✅ Message hash calculated:');
  console.log(hash);
  console.log('\n🔗 Test with Circle Attestation API:');
  console.log(`curl https://iris-api-sandbox.circle.com/attestations/${hash}`);
  
  const isValid = messageHashExtractor.isValidMessageHash(hash);
  console.log('Valid format:', isValid ? '✅' : '❌');
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  Extract from transaction:');
  console.log('    ts-node scripts/extract-message-hash.ts <tx-hash> [blockchain]');
  console.log('  Calculate from message bytes:');
  console.log('    ts-node scripts/extract-message-hash.ts --bytes <hex-bytes>');
  console.log('');
  console.log('Examples:');
  console.log('  ts-node scripts/extract-message-hash.ts abc123def456 stellar');
  console.log('  ts-node scripts/extract-message-hash.ts --bytes 0x00000000000001...');
  process.exit(1);
}

if (args[0] === '--bytes') {
  if (!args[1]) {
    console.error('Error: Please provide message bytes');
    process.exit(1);
  }
  calculateMessageHashFromBytes(args[1]);
} else {
  const txHash = args[0];
  const blockchain = (args[1] || 'stellar') as 'stellar' | 'ethereum' | 'avalanche';
  extractMessageHash(txHash, blockchain);
}
