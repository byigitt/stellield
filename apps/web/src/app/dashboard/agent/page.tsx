import AgentPage from "./agent-page";

export const metadata = {
	title: "AI Agent Recommendations | Stellield",
	description: "AI-powered yield recommendations using Google Gemini 2.0 Flash",
};

export default function Page() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#151932] to-[#1a1f3a]">
			<div className="container mx-auto px-4 py-6">
				<h1 className="text-3xl font-bold text-white mb-2">AI Agent Recommendations</h1>
				<p className="text-gray-400 mb-6">
					Get personalized yield recommendations by our AI agent.
				</p>
			</div>
			<AgentPage />
		</div>
	);
}
