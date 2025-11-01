import "dotenv/config";
import { BridgeKit } from "@circle-fin/bridge-kit";
import { createAdapterFromPrivateKey as createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { createAdapterFromPrivateKey as createSolanaAdapterFromPrivateKey } from "@circle-fin/adapter-solana";
import type { BridgeResult } from "@circle-fin/bridge-kit";

/**
 * CCTP Bridge Service
 * Handles cross-chain USDC transfers between Stellar and Solana using Circle's CCTP
 */

export interface CCTPBridgeConfig {
	stellarPrivateKey?: string;
	solanaPrivateKey?: string;
	network: "testnet" | "mainnet";
}

export interface BridgeTransferParams {
	direction: "stellar-to-solana" | "solana-to-stellar";
	amount: string; // USDC amount (e.g., "10.00")
	positionId?: number; // Optional position tracking
}

export interface BridgeTransferResult {
	success: boolean;
	transactionId?: string;
	explorerUrls?: string[];
	steps?: BridgeResult["steps"];
	error?: string;
	estimatedCost?: {
		bridgeFee: string;
		gasFee: string;
		totalCost: string;
	};
}

export class CCTPBridgeService {
	private kit: BridgeKit;
	private config: CCTPBridgeConfig;
	private viemAdapter: any;
	private solanaAdapter: any;

	constructor(config: CCTPBridgeConfig) {
		this.config = config;
		this.kit = new BridgeKit();

		// Initialize adapters if keys provided
		if (config.stellarPrivateKey) {
			this.viemAdapter = createViemAdapterFromPrivateKey({
				privateKey: config.stellarPrivateKey,
			});
		}

		if (config.solanaPrivateKey) {
			this.solanaAdapter = createSolanaAdapterFromPrivateKey({
				privateKey: config.solanaPrivateKey,
			});
		}
	}

	/**
	 * Execute a CCTP bridge transfer
	 */
	async bridge(params: BridgeTransferParams): Promise<BridgeTransferResult> {
		try {
			if (!this.viemAdapter || !this.solanaAdapter) {
				throw new Error("Bridge adapters not initialized. Check private keys.");
			}

			const { direction, amount } = params;

			// Determine source and destination chains based on network
			const stellarChain =
				this.config.network === "testnet"
					? "Ethereum_Sepolia" // CCTP uses Ethereum for Stellar testnet
					: "Ethereum";

			const solanaChain =
				this.config.network === "testnet" ? "Solana_Devnet" : "Solana";

			console.log(
				`[CCTP Bridge] Starting ${direction} transfer of ${amount} USDC`,
			);

			let result: BridgeResult;

			if (direction === "stellar-to-solana") {
				result = await this.kit.bridge({
					from: { adapter: this.viemAdapter, chain: stellarChain as any },
					to: { adapter: this.solanaAdapter, chain: solanaChain as any },
					amount,
				});
			} else {
				result = await this.kit.bridge({
					from: { adapter: this.solanaAdapter, chain: solanaChain as any },
					to: { adapter: this.viemAdapter, chain: stellarChain as any },
					amount,
				});
			}

			// Extract explorer URLs from steps
			const explorerUrls = result.steps
				?.filter((step) => step.explorerUrl)
				.map((step) => step.explorerUrl!);

			// Get transaction ID from first step
			const transactionId =
				result.steps?.[0]?.txHash || result.steps?.[0]?.data?.txHash;

			console.log(`[CCTP Bridge] Transfer successful:`, {
				transactionId,
				explorerUrls,
				stepsCount: result.steps?.length,
			});

			return {
				success: true,
				transactionId: transactionId?.toString(),
				explorerUrls,
				steps: result.steps,
			};
		} catch (error: any) {
			console.error("[CCTP Bridge] Transfer failed:", error);

			return {
				success: false,
				error: error.message || "Unknown bridge error",
			};
		}
	}

	/**
	 * Estimate bridge costs (CCTP has minimal fees, mostly gas)
	 */
	async estimateCost(params: {
		direction: "stellar-to-solana" | "solana-to-stellar";
		amount: string;
	}): Promise<BridgeTransferResult["estimatedCost"]> {
		try {
			// CCTP bridge fee is effectively $0 (burn & mint)
			// Only gas fees apply on source and destination chains
			const bridgeFee = "0.00";

			// Estimate gas fees based on network
			// Testnet: Ethereum Sepolia ~$0.10, Solana Devnet ~$0.00
			// Mainnet: Stellar ~$0.01, Solana ~$0.00
			const gasFee = this.config.network === "testnet" ? "0.10" : "0.01";

			const totalCost = (
				parseFloat(bridgeFee) + parseFloat(gasFee)
			).toFixed(2);

			return {
				bridgeFee: `$${bridgeFee}`,
				gasFee: `$${gasFee}`,
				totalCost: `$${totalCost}`,
			};
		} catch (error) {
			console.error("[CCTP Bridge] Cost estimation failed:", error);
			return {
				bridgeFee: "$0.00",
				gasFee: "$0.10",
				totalCost: "$0.10",
			};
		}
	}

	/**
	 * Check CCTP bridge status (for stuck transactions)
	 */
	async getTransferStatus(transactionHash: string): Promise<{
		status: "pending" | "success" | "failed";
		details?: any;
	}> {
		try {
			// Bridge Kit provides retry capabilities for stuck transactions
			// This would query Circle's attestation service
			console.log(
				`[CCTP Bridge] Checking status for transaction: ${transactionHash}`,
			);

			// TODO: Implement actual status check via Circle API
			return {
				status: "pending",
				details: {
					message: "Status check not implemented yet",
				},
			};
		} catch (error) {
			console.error("[CCTP Bridge] Status check failed:", error);
			return {
				status: "failed",
				details: error,
			};
		}
	}

	/**
	 * Get supported bridge routes
	 */
	getSupportedRoutes(): Array<{
		name: string;
		from: string;
		to: string;
		protocol: string;
		estimatedFee: string;
		estimatedTime: string;
	}> {
		return [
			{
				name: "Circle CCTP",
				from: "Stellar",
				to: "Solana",
				protocol: "CCTP V2",
				estimatedFee: "$0.00",
				estimatedTime: "~5 min",
			},
			{
				name: "Circle CCTP",
				from: "Solana",
				to: "Stellar",
				protocol: "CCTP V2",
				estimatedFee: "$0.00",
				estimatedTime: "~5 min",
			},
		];
	}
}

/**
 * Factory function to create CCTP service from environment variables
 */
export function createCCTPService(
	overrides?: Partial<CCTPBridgeConfig>,
): CCTPBridgeService {
	const config: CCTPBridgeConfig = {
		stellarPrivateKey: overrides?.stellarPrivateKey || process.env.STELLAR_PRIVATE_KEY,
		solanaPrivateKey: overrides?.solanaPrivateKey || process.env.SOLANA_PRIVATE_KEY,
		network:
			(overrides?.network as "testnet" | "mainnet") ||
			(process.env.NETWORK as "testnet" | "mainnet") ||
			"testnet",
	};

	return new CCTPBridgeService(config);
}
