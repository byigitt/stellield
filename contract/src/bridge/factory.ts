import { config } from '../config';
import { logger } from '../utils/logger';
import { BridgeAttestationProvider } from './attestation-provider';
import { CircleAttestationService } from './attestation';
import { ManualAttestationService } from './manual-attestation';

export function createBridgeAttestationService(): BridgeAttestationProvider {
  const provider = config.bridge.provider;

  switch (provider) {
    case 'manual':
      logger.info('Using manual bridge attestation provider');
      return new ManualAttestationService();
    case 'circle':
    default:
      if (provider !== 'circle') {
        logger.warn('Unknown bridge provider configured, defaulting to Circle attestation.', {
          provider,
        });
      }
      return new CircleAttestationService();
  }
}
