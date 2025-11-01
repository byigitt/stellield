/**
 * Transaction state management
 * Tracks the state of cross-chain transactions
 */

import { TransactionState, TransactionStatus, TransactionStep } from '../types';
import { logger } from '../utils/logger';

export class StateManager {
  private states: Map<string, TransactionState> = new Map();

  /**
   * Create a new transaction state
   */
  createTransaction(
    userAddress: string,
    amount: string
  ): TransactionState {
    const id = this.generateTransactionId();
    const now = new Date();

    const state: TransactionState = {
      id,
      status: TransactionStatus.PENDING,
      currentStep: TransactionStep.XLM_RECEIVED,
      userAddress,
      amount,
      createdAt: now,
      updatedAt: now,
      stellarTxHashes: {},
      solanaTxSignatures: {},
      amounts: {
        xlmDeposit: amount,
      },
    };

    this.states.set(id, state);
    
    logger.info('Transaction state created', { id, userAddress, amount });
    
    return state;
  }

  /**
   * Update transaction status
   */
  updateStatus(
    id: string,
    status: TransactionStatus,
    error?: string
  ): void {
    const state = this.states.get(id);
    if (!state) {
      throw new Error(`Transaction ${id} not found`);
    }

    state.status = status;
    state.updatedAt = new Date();
    
    if (error) {
      state.error = error;
    }

    logger.info('Transaction status updated', { id, status, error });
  }

  /**
   * Update current step
   */
  updateStep(id: string, step: TransactionStep): void {
    const state = this.states.get(id);
    if (!state) {
      throw new Error(`Transaction ${id} not found`);
    }

    state.currentStep = step;
    state.updatedAt = new Date();

    logger.info('Transaction step updated', { id, step });
  }

  /**
   * Update stellar transaction hash
   */
  updateStellarTx(
    id: string,
    type: keyof TransactionState['stellarTxHashes'],
    hash: string
  ): void {
    const state = this.states.get(id);
    if (!state) {
      throw new Error(`Transaction ${id} not found`);
    }

    state.stellarTxHashes[type] = hash;
    state.updatedAt = new Date();

    logger.debug('Stellar tx hash updated', { id, type, hash });
  }

  /**
   * Update solana transaction signature
   */
  updateSolanaTx(
    id: string,
    type: keyof TransactionState['solanaTxSignatures'],
    signature: string
  ): void {
    const state = this.states.get(id);
    if (!state) {
      throw new Error(`Transaction ${id} not found`);
    }

    state.solanaTxSignatures[type] = signature;
    state.updatedAt = new Date();

    logger.debug('Solana tx signature updated', { id, type, signature });
  }

  /**
   * Update bridge data
   */
  updateBridgeData(
    id: string,
    data: Partial<NonNullable<TransactionState['bridgeData']>>
  ): void {
    const state = this.states.get(id);
    if (!state) {
      throw new Error(`Transaction ${id} not found`);
    }

    state.bridgeData = {
      ...state.bridgeData,
      ...data,
    };
    state.updatedAt = new Date();

    logger.debug('Bridge data updated', { id, data });
  }

  /**
   * Update amounts
   */
  updateAmounts(
    id: string,
    amounts: Partial<TransactionState['amounts']>
  ): void {
    const state = this.states.get(id);
    if (!state) {
      throw new Error(`Transaction ${id} not found`);
    }

    state.amounts = {
      ...state.amounts,
      ...amounts,
    };
    state.updatedAt = new Date();

    logger.debug('Amounts updated', { id, amounts });
  }

  /**
   * Get transaction state
   */
  getState(id: string): TransactionState | undefined {
    return this.states.get(id);
  }

  /**
   * Get all transactions for a user
   */
  getUserTransactions(userAddress: string): TransactionState[] {
    return Array.from(this.states.values()).filter(
      (state) => state.userAddress === userAddress
    );
  }

  /**
   * Get transactions by status
   */
  getTransactionsByStatus(status: TransactionStatus): TransactionState[] {
    return Array.from(this.states.values()).filter(
      (state) => state.status === status
    );
  }

  /**
   * Delete transaction state
   */
  deleteState(id: string): void {
    this.states.delete(id);
    logger.info('Transaction state deleted', { id });
  }

  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export state for persistence
   */
  exportState(id: string): string {
    const state = this.states.get(id);
    if (!state) {
      throw new Error(`Transaction ${id} not found`);
    }

    return JSON.stringify(state, null, 2);
  }

  /**
   * Import state from persistence
   */
  importState(stateJson: string): string {
    const state = JSON.parse(stateJson) as TransactionState;
    this.states.set(state.id, state);
    
    logger.info('Transaction state imported', { id: state.id });
    
    return state.id;
  }

  /**
   * Get all transaction IDs
   */
  getAllTransactionIds(): string[] {
    return Array.from(this.states.keys());
  }

  /**
   * Clear all states
   */
  clearAll(): void {
    this.states.clear();
    logger.warn('All transaction states cleared');
  }
}

