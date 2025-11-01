import { redirect } from "next/navigation";
import Dashboard from "./dashboard";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";

export default async function DashboardPage() {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
			throw: true,
		},
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-white mb-2">Stellar Yield Dashboard</h1>
				<p className="text-gray-400">Welcome back, {session.user.name}! Monitor your Stellar yield opportunities and portfolio performance.</p>
			</div>
			<Dashboard session={session} />
		</div>
	);
}
