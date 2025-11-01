/**
 * Extract base58 private key from Solana keypair JSON file
 */

import * as fs from 'fs';
import * as path from 'path';
import bs58 from 'bs58';

const keypairPath = process.argv[2] || path.join(process.env.HOME || '~', 'solana-devnet-keypair.json');

try {
  console.log('Reading keypair from:', keypairPath);
  
  const keypairData = fs.readFileSync(keypairPath, 'utf-8');
  const keypairArray = JSON.parse(keypairData);
  
  // Convert array to Uint8Array
  const secretKey = Uint8Array.from(keypairArray);
  
  // Encode to base58
  const base58PrivateKey = bs58.encode(secretKey);
  
  console.log('\n==============================================');
  console.log('✅ Solana Keypair Information');
  console.log('==============================================\n');
  console.log('Public Key (from file):');
  console.log('  5pMh6qHp8uTig3bdoaCoYqyFJM4vJMDQVvu4ttMf6BH3\n');
  console.log('Private Key (Base58) - Add to .env:');
  console.log('  ' + base58PrivateKey);
  console.log('\n==============================================');
  console.log('\nAdd this line to your .env file:');
  console.log(`SOLANA_PRIVATE_KEY=${base58PrivateKey}`);
  console.log('\n==============================================\n');
  
} catch (error: any) {
  console.error('Error reading keypair file:', error.message);
  console.log('\nUsage: ts-node scripts/get-solana-key.ts [path-to-keypair.json]');
  console.log('Default path: ~/solana-devnet-keypair.json');
  process.exit(1);
}

