/**
 * Ethereum Client for CCTP Bridge
 * Simplified - focuses only on Stellar ↔ Ethereum
 */

import { ethers } from 'ethers';
import { logger } from '../utils/logger';

// Minimal ABIs for CCTP contracts
const TOKEN_MESSENGER_ABI = [
  'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) returns (uint64)',
  'event DepositForBurn(uint64 indexed nonce, address indexed burnToken, uint256 amount, address indexed depositor, bytes32 mintRecipient, uint32 destinationDomain, bytes32 destinationTokenMessenger, bytes32 destinationCaller)',
];

const USDC_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export class EthereumClient {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private tokenMessenger: ethers.Contract;
  private usdc: ethers.Contract;

  constructor(
    privateKey: string,
    rpcUrl: string,
    tokenMessengerAddress: string,
    usdcAddress: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);

    this.tokenMessenger = new ethers.Contract(
      tokenMessengerAddress,
      TOKEN_MESSENGER_ABI,
      this.signer
    );

    this.usdc = new ethers.Contract(usdcAddress, USDC_ABI, this.signer);

    logger.info('Ethereum client initialized');
  }

  /**
   * Get Ethereum address
   */
  async getAddress(): Promise<string> {
    return await this.signer.getAddress();
  }

  /**
   * Get USDC balance
   */
  async getUSDCBalance(): Promise<string> {
    const balance = await this.usdc.balanceOf(await this.getAddress());
    return ethers.formatUnits(balance, 6);
  }

  /**
   * Burn USDC to send to Stellar
   */
  async burnUSDC(amount: string, stellarRecipient: string): Promise<{
    txHash: string;
    nonce: string;
    messageHash: string;
  }> {
    logger.info('Burning USDC on Ethereum', { amount, stellarRecipient });

    // Convert amount to 6 decimals
    const amountBN = ethers.parseUnits(amount, 6);

    // Convert Stellar address to bytes32
    const recipientBytes32 = ethers.zeroPadValue(
      ethers.toUtf8Bytes(stellarRecipient.slice(0, 32)),
      32
    );

    // Approve USDC
    const approveTx = await this.usdc.approve(
      await this.tokenMessenger.getAddress(),
      amountBN
    );
    await approveTx.wait();
    logger.info('USDC approved');

    // Burn
    const burnTx = await this.tokenMessenger.depositForBurn(
      amountBN,
      0, // Stellar domain = 0
      recipientBytes32,
      await this.usdc.getAddress()
    );

    const receipt = await burnTx.wait();
    logger.info('Burn complete', { txHash: receipt.hash });

    // Extract nonce from event
    const event = receipt.logs
      .map((log: any) => {
        try {
          return this.tokenMessenger.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === 'DepositForBurn');

    const nonce = event?.args?.nonce?.toString() || '0';
    const messageHash = ethers.keccak256(
      ethers.toUtf8Bytes(`${receipt.hash}-${nonce}`)
    );

    return {
      txHash: receipt.hash,
      nonce,
      messageHash,
    };
  }
}
