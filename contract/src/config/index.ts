/**
 * Configuration management for the application
 */

import dotenv from 'dotenv';
import { AppConfig } from '../types';

// Load environment variables (override any existing ones)
dotenv.config({ override: true });

export function getConfig(): AppConfig {
  // Validate required Stellar environment variables
  const requiredStellarVars = [
    'STELLAR_NETWORK',
    'STELLAR_HORIZON_URL',
    'STELLAR_PRIVATE_KEY',
    'STELLAR_USDC_ADDRESS',
  ];

  const missingStellar = requiredStellarVars.filter(v => !process.env[v]);
  if (missingStellar.length > 0) {
    throw new Error(`Missing required Stellar environment variables: ${missingStellar.join(', ')}`);
  }

  const config: AppConfig = {
    stellar: {
      network: process.env.STELLAR_NETWORK as 'testnet' | 'mainnet',
      horizonUrl: process.env.STELLAR_HORIZON_URL!,
      privateKey: process.env.STELLAR_PRIVATE_KEY!,
      publicKey: process.env.STELLAR_PUBLIC_KEY,
      cctpTokenMessenger: process.env.STELLAR_CCTP_TOKEN_MESSENGER,
      messageTransmitter: process.env.STELLAR_MESSAGE_TRANSMITTER,
      usdcAddress: process.env.STELLAR_USDC_ADDRESS!,
    },
    bridge: {
      circleAttestationApi: process.env.CIRCLE_ATTESTATION_API || 'https://iris-api-sandbox.circle.com',
      provider: (process.env.BRIDGE_PROVIDER as AppConfig['bridge']['provider']) || 'circle',
    },
  };

  // Add Ethereum config if available
  if (process.env.ETHEREUM_RPC_URL && process.env.ETHEREUM_PRIVATE_KEY) {
    config.ethereum = {
      rpcUrl: process.env.ETHEREUM_RPC_URL,
      privateKey: process.env.ETHEREUM_PRIVATE_KEY,
      chainId: parseInt(process.env.ETHEREUM_CHAIN_ID || '11155111', 10),
      usdc: process.env.ETHEREUM_USDC || '',
      tokenMessenger: process.env.ETHEREUM_TOKEN_MESSENGER || '',
      messageTransmitter: process.env.ETHEREUM_MESSAGE_TRANSMITTER || '',
    };

    // Add Aave config if Ethereum is configured
    if (process.env.AAVE_POOL_ADDRESS) {
      config.aave = {
        poolAddress: process.env.AAVE_POOL_ADDRESS,
        poolDataProviderAddress: process.env.AAVE_POOL_DATA_PROVIDER || '',
        aUSDCAddress: process.env.AAVE_AUSDC_ADDRESS || '',
      };
    }
  }

  // Add Solana config if available (for existing Solana flows)
  if (process.env.SOLANA_RPC_URL && process.env.SOLANA_PRIVATE_KEY) {
    config.solana = {
      network: (process.env.SOLANA_NETWORK as 'devnet' | 'testnet' | 'mainnet-beta') || 'devnet',
      rpcUrl: process.env.SOLANA_RPC_URL,
      privateKey: process.env.SOLANA_PRIVATE_KEY,
      cctpTokenMessenger: process.env.SOLANA_CCTP_TOKEN_MESSENGER,
      messageTransmitter: process.env.SOLANA_MESSAGE_TRANSMITTER,
      usdcMint: process.env.SOLANA_USDC_MINT || '',
    };

    // Add Marinade config if Solana is configured
    if (process.env.MARINADE_PROGRAM_ID) {
      config.marinade = {
        programId: process.env.MARINADE_PROGRAM_ID,
      };
    }
  }

  // Add Allbridge config if available
  if (process.env.ALLBRIDGE_CORE_API_URL) {
    config.allbridge = {
      coreApiUrl: process.env.ALLBRIDGE_CORE_API_URL,
      jupiterUrl: process.env.ALLBRIDGE_JUPITER_URL || '',
      wormholeMessengerProgramId: process.env.ALLBRIDGE_WORMHOLE_MESSENGER || '',
      solanaLookupTable: process.env.ALLBRIDGE_SOLANA_LOOKUP_TABLE || '',
      sorobanNetworkPassphrase: process.env.ALLBRIDGE_SOROBAN_PASSPHRASE || '',
      sorobanRpcUrl: process.env.ALLBRIDGE_SOROBAN_RPC_URL || '',
      trustlineLimit: process.env.ALLBRIDGE_TRUSTLINE_LIMIT || '922337203685',
      stellarTokenSymbol: process.env.ALLBRIDGE_STELLAR_TOKEN_SYMBOL || 'USDC',
      stellarTokenAddress: process.env.ALLBRIDGE_STELLAR_TOKEN_ADDRESS,
      solanaTokenSymbol: process.env.ALLBRIDGE_SOLANA_TOKEN_SYMBOL || 'USDC',
      solanaTokenAddress: process.env.ALLBRIDGE_SOLANA_TOKEN_ADDRESS,
      statusPollIntervalMs: parseInt(process.env.ALLBRIDGE_STATUS_POLL_INTERVAL_MS || '5000', 10),
      statusMaxAttempts: parseInt(process.env.ALLBRIDGE_STATUS_MAX_ATTEMPTS || '60', 10),
    };
  }

  return config;
}

export const config = getConfig();
