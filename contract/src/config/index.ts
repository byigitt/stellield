/**
 * Configuration management for the application
 */

import dotenv from 'dotenv';
import { AppConfig } from '../types';

// Load environment variables (override any existing ones)
dotenv.config({ override: true });

export function getConfig(): AppConfig {
  // Validate required environment variables
  const requiredVars = [
    'STELLAR_NETWORK',
    'STELLAR_HORIZON_URL',
    'STELLAR_PRIVATE_KEY',
    'STELLAR_USDC_ADDRESS',
    'SOLANA_NETWORK',
    'SOLANA_RPC_URL',
    'SOLANA_PRIVATE_KEY',
    'SOLANA_USDC_MINT',
    'CIRCLE_ATTESTATION_API',
    'MARINADE_PROGRAM_ID',
  ];

  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    stellar: {
      network: process.env.STELLAR_NETWORK as 'testnet' | 'mainnet',
      horizonUrl: process.env.STELLAR_HORIZON_URL!,
      privateKey: process.env.STELLAR_PRIVATE_KEY!,
      cctpTokenMessenger: process.env.STELLAR_CCTP_TOKEN_MESSENGER,
      usdcAddress: process.env.STELLAR_USDC_ADDRESS!,
    },
    solana: {
      network: process.env.SOLANA_NETWORK as 'devnet' | 'testnet' | 'mainnet-beta',
      rpcUrl: process.env.SOLANA_RPC_URL!,
      privateKey: process.env.SOLANA_PRIVATE_KEY!,
      cctpTokenMessenger: process.env.SOLANA_CCTP_TOKEN_MESSENGER,
      usdcMint: process.env.SOLANA_USDC_MINT!,
    },
    bridge: {
      circleAttestationApi: process.env.CIRCLE_ATTESTATION_API!,
    },
    marinade: {
      programId: process.env.MARINADE_PROGRAM_ID!,
    },
  };
}

export const config = getConfig();

