import Dashboard from "./dashboard";

export default async function DashboardPage() {

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#151932] to-[#1a1f3a]">
			{/* Main Content */}
			<div className="container mx-auto px-4 py-6">
				<h1 className="text-3xl font-bold text-white mb-2">Stellar Yield Dashboard</h1>
				<p className="text-gray-400">Welcome back, John Doe! Monitor your Stellar yield opportunities and portfolio performance.</p>
			</div>
			<Dashboard />
		</div>
	);
}
