"use client";
import StellarYieldOpportunities from "@/components/stellar-yield-opportunities";
import PortfolioSimulator from "@/components/portfolio-simulator";
import BridgeInsights from "@/components/bridge-insights";
import StellarProtocols from "@/components/stellar-protocols";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#151932] to-[#1a1f3a]">
			{/* Main Content */}
			<div className="container mx-auto px-4 py-6">
				{/* Yield Opportunities Section */}
				<div className="mb-8">
					<StellarYieldOpportunities />
				</div>

				{/* Main Dashboard Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Stellar Protocols List */}
					<div className="lg:col-span-1">
						<StellarProtocols />
					</div>

					{/* Middle Column - Portfolio Simulator */}
					<div className="lg:col-span-1">
						<PortfolioSimulator />
					</div>

					{/* Right Column - Bridge Insights & Risk Metrics */}
					<div className="lg:col-span-1">
						<BridgeInsights />
					</div>
				</div>
			</div>
		</div>
	);
}
