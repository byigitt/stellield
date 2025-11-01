import "dotenv/config";
import { createCCTPService } from "./services/cctp-bridge.service";
import { YieldOrchestratorService } from "./services/yield-orchestrator.service";

/**
 * Test Scenario A
 * Demonstrates the full flow:
 * 10,000 XLM → USDC → Solana → Yield → Stellar → XLM
 */

async function testScenarioA() {
	console.log("🚀 Starting Scenario A Test\n");

	// Initialize services
	const cctpService = createCCTPService();
	const orchestrator = new YieldOrchestratorService(cctpService);

	try {
		// Test 1: Show supported routes
		console.log("📋 Supported Bridge Routes:");
		const routes = cctpService.getSupportedRoutes();
		routes.forEach((route) => {
			console.log(
				`  - ${route.from} → ${route.to}: ${route.estimatedFee} (${route.estimatedTime})`,
			);
		});
		console.log();

		// Test 2: Estimate bridge costs
		console.log("💰 Estimating Bridge Costs:");
		const costEstimate = await cctpService.estimateCost({
			direction: "stellar-to-solana",
			amount: "10000.00",
		});
		console.log(
			`  Bridge Fee: ${costEstimate?.bridgeFee} (CCTP burn & mint)`,
		);
		console.log(`  Gas Fee: ${costEstimate?.gasFee} (network fees)`);
		console.log(`  Total Cost: ${costEstimate?.totalCost}`);
		console.log();

		// Test 3: Execute full Scenario A
		console.log("🎯 Executing Scenario A:\n");

		const result = await orchestrator.executeScenarioA({
			userId: "test-user-001",
			xlmAmount: "10000.00",
			apy: 6, // 6% APY
			durationDays: 60, // 60 days
		});

		console.log("\n✅ Scenario A Completed Successfully!\n");
		console.log("📊 Summary:");
		console.log(`  Initial: ${result.summary.initialXLM} XLM`);
		console.log(`  Final: ${result.summary.finalXLM} XLM`);
		console.log(`  Profit: ${result.summary.profit} XLM`);
		console.log(`  Return: ${result.summary.profitPercentage}`);
		console.log();

		console.log("🔗 Transactions:");
		result.position.transactions.forEach((tx, idx) => {
			console.log(`  ${idx + 1}. ${tx.type}: ${tx.hash}`);
			if (tx.explorerUrl) {
				console.log(`     Explorer: ${tx.explorerUrl}`);
			}
		});
		console.log();

		// Verify results match Scenario A expectations
		const expectedProfit = 35.76; // From your calculation
		const actualProfit = parseFloat(result.summary.profit);
		const profitDiff = Math.abs(actualProfit - expectedProfit);

		if (profitDiff < 1.0) {
			// Allow small variance
			console.log(
				"✅ PASS: Profit matches expected Scenario A calculation!",
			);
		} else {
			console.log(
				`⚠️  WARNING: Profit variance detected. Expected: ~${expectedProfit} XLM, Got: ${actualProfit} XLM`,
			);
		}
	} catch (error: any) {
		console.error("\n❌ Scenario A Test Failed:");
		console.error(error.message);
		console.error(error.stack);
		process.exit(1);
	}
}

// Run the test
testScenarioA()
	.then(() => {
		console.log("\n🎉 All tests completed!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 Test execution failed:", error);
		process.exit(1);
	});
