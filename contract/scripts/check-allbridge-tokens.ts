/**
 * Script to discover available Allbridge tokens for Stellar and Solana
 *
 * This helps identify the correct token symbols and addresses to use in .env
 */

import { AllbridgeCoreSdk, ChainSymbol, mainnet as allbridgeMainnet } from '@allbridge/bridge-core-sdk';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       Allbridge Token Discovery Tool                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const nodeRpcUrls = {
    [ChainSymbol.SRB]: process.env.ALLBRIDGE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
    [ChainSymbol.STLR]: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    [ChainSymbol.SOL]: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    [ChainSymbol.POL]: 'https://polygon-rpc.com',
  };

  const sdk = new AllbridgeCoreSdk(nodeRpcUrls, {
    ...allbridgeMainnet,
    coreApiUrl: process.env.ALLBRIDGE_CORE_API_URL || 'https://core.api.allbridgecoreapi.net',
    jupiterUrl: process.env.ALLBRIDGE_JUPITER_URL || allbridgeMainnet.jupiterUrl,
    wormholeMessengerProgramId: process.env.ALLBRIDGE_WORMHOLE_MESSENGER_ID || allbridgeMainnet.wormholeMessengerProgramId,
    solanaLookUpTable: process.env.ALLBRIDGE_SOLANA_LOOKUP_TABLE || allbridgeMainnet.solanaLookUpTable,
    sorobanNetworkPassphrase: process.env.ALLBRIDGE_SOROBAN_PASSPHRASE || 'Test SDF Network ; September 2015',
  });

  try {
    console.log('🔍 Fetching chain details from Allbridge...\n');
    const chainMap = await sdk.chainDetailsMap();

    // Display Stellar tokens
    console.log('═══════════════════════════════════════════════════════');
    console.log('📍 STELLAR (SRB) - Available Tokens');
    console.log('═══════════════════════════════════════════════════════\n');

    const stellarTokens = chainMap[ChainSymbol.SRB]?.tokens ?? [];
    if (stellarTokens.length === 0) {
      console.log('⚠️  No tokens found for Stellar chain\n');
    } else {
      stellarTokens.forEach((token, idx) => {
        console.log(`Token ${idx + 1}:`);
        console.log(`  Symbol:       ${token.symbol}`);
        console.log(`  Name:         ${token.name}`);
        console.log(`  Address:      ${token.tokenAddress}`);
        console.log(`  Decimals:     ${token.decimals}`);
        console.log(`  Pool Address: ${token.poolAddress}`);
        console.log('');
      });
    }

    // Display Solana tokens
    console.log('═══════════════════════════════════════════════════════');
    console.log('📍 SOLANA (SOL) - Available Tokens');
    console.log('═══════════════════════════════════════════════════════\n');

    const solanaTokens = chainMap[ChainSymbol.SOL]?.tokens ?? [];
    if (solanaTokens.length === 0) {
      console.log('⚠️  No tokens found for Solana chain\n');
    } else {
      solanaTokens.forEach((token, idx) => {
        console.log(`Token ${idx + 1}:`);
        console.log(`  Symbol:       ${token.symbol}`);
        console.log(`  Name:         ${token.name}`);
        console.log(`  Address:      ${token.tokenAddress}`);
        console.log(`  Decimals:     ${token.decimals}`);
        console.log(`  Pool Address: ${token.poolAddress}`);
        console.log('');
      });
    }

    // Display Polygon tokens
    console.log('═══════════════════════════════════════════════════════');
    console.log('📍 POLYGON (POL) - Available Tokens');
    console.log('═══════════════════════════════════════════════════════\n');

    const polygonTokens = chainMap[ChainSymbol.POL]?.tokens ?? [];
    if (polygonTokens.length === 0) {
      console.log('⚠️  No tokens found for Polygon chain\n');
    } else {
      polygonTokens.forEach((token, idx) => {
        console.log(`Token ${idx + 1}:`);
        console.log(`  Symbol:       ${token.symbol}`);
        console.log(`  Name:         ${token.name}`);
        console.log(`  Address:      ${token.tokenAddress}`);
        console.log(`  Decimals:     ${token.decimals}`);
        console.log(`  Pool Address: ${token.poolAddress}`);
        console.log('');
      });
    }

    // Find matching token pairs - Stellar ⇄ Solana
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔗 Bridgeable Token Pairs (Stellar ⇄ Solana)');
    console.log('═══════════════════════════════════════════════════════\n');

    const solanaMatches: Array<{ stellarToken: any; solanaToken: any }> = [];

    for (const stellarToken of stellarTokens) {
      for (const solanaToken of solanaTokens) {
        if (stellarToken.symbol.toUpperCase() === solanaToken.symbol.toUpperCase()) {
          solanaMatches.push({ stellarToken, solanaToken });
        }
      }
    }

    if (solanaMatches.length === 0) {
      console.log('⚠️  No matching token pairs found\n');
    } else {
      solanaMatches.forEach((match, idx) => {
        console.log(`Pair ${idx + 1}: ${match.stellarToken.symbol}`);
        console.log(`  Stellar:`);
        console.log(`    Symbol:  ${match.stellarToken.symbol}`);
        console.log(`    Address: ${match.stellarToken.tokenAddress}`);
        console.log(`  Solana:`);
        console.log(`    Symbol:  ${match.solanaToken.symbol}`);
        console.log(`    Address: ${match.solanaToken.tokenAddress}`);
        console.log('');
      });
    }

    // Find matching token pairs - Stellar ⇄ Polygon
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔗 Bridgeable Token Pairs (Stellar ⇄ Polygon)');
    console.log('═══════════════════════════════════════════════════════\n');

    const polygonMatches: Array<{ stellarToken: any; polygonToken: any }> = [];

    for (const stellarToken of stellarTokens) {
      for (const polygonToken of polygonTokens) {
        if (stellarToken.symbol.toUpperCase() === polygonToken.symbol.toUpperCase()) {
          polygonMatches.push({ stellarToken, polygonToken });
        }
      }
    }

    if (polygonMatches.length === 0) {
      console.log('⚠️  No matching token pairs found\n');
    } else {
      polygonMatches.forEach((match, idx) => {
        console.log(`Pair ${idx + 1}: ${match.stellarToken.symbol}`);
        console.log(`  Stellar:`);
        console.log(`    Symbol:  ${match.stellarToken.symbol}`);
        console.log(`    Address: ${match.stellarToken.tokenAddress}`);
        console.log(`  Polygon:`);
        console.log(`    Symbol:  ${match.polygonToken.symbol}`);
        console.log(`    Address: ${match.polygonToken.tokenAddress}`);
        console.log('');
      });
    }

    const matches = solanaMatches;

    // Generate .env configuration
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 Suggested .env Configuration');
    console.log('═══════════════════════════════════════════════════════\n');

    if (matches.length > 0) {
      const firstMatch = matches[0];
      console.log('# Allbridge Token Configuration');
      console.log(`ALLBRIDGE_STELLAR_TOKEN_SYMBOL=${firstMatch.stellarToken.symbol}`);
      console.log(`ALLBRIDGE_STELLAR_TOKEN_ADDRESS=${firstMatch.stellarToken.tokenAddress}`);
      console.log(`ALLBRIDGE_SOLANA_TOKEN_SYMBOL=${firstMatch.solanaToken.symbol}`);
      console.log(`ALLBRIDGE_SOLANA_TOKEN_ADDRESS=${firstMatch.solanaToken.tokenAddress}`);
      console.log('');
    } else {
      console.log('⚠️  No token pairs found. You may need to:');
      console.log('   1. Use mainnet instead of testnet/devnet');
      console.log('   2. Check if Allbridge supports your network configuration');
      console.log('   3. Verify your RPC URLs are correct');
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('ℹ️  Configuration Details');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Core API URL:         ${process.env.ALLBRIDGE_CORE_API_URL || 'https://core.api.allbridgecoreapi.net'}`);
    console.log(`Stellar Network:      ${process.env.STELLAR_NETWORK || 'testnet'}`);
    console.log(`Solana Network:       ${process.env.SOLANA_NETWORK || 'devnet'}`);
    console.log(`Soroban Network:      ${process.env.ALLBRIDGE_SOROBAN_PASSPHRASE?.split(';')[0].trim() || 'Test SDF Network'}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error fetching Allbridge tokens:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  - Check your internet connection');
    console.error('  - Verify RPC URLs are accessible');
    console.error('  - Ensure Allbridge Core API is reachable');
    console.error('');
  }
}

main().catch(console.error);
