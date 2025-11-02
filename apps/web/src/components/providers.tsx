"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PrivyProvider } from "@privy-io/react-auth";
import { sepolia } from "viem/chains";
import { queryClient } from "@/utils/trpc";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

const resolvedSepoliaRpcUrl =
	process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
	sepolia.rpcUrls.default?.http?.[0];

const sepoliaChain = {
	...sepolia,
	rpcUrls: {
		default: {
			...sepolia.rpcUrls.default,
			http: resolvedSepoliaRpcUrl
				? [resolvedSepoliaRpcUrl]
				: sepolia.rpcUrls.default?.http ?? [],
		},
	},
} as const;

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<PrivyProvider
			appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
			config={{
				appearance: {
					theme: "dark",
					accentColor: "#676FFF",
					logo: "/logo-main.png",
				},
				defaultChain: sepoliaChain,
				supportedChains: [sepoliaChain],
				embeddedWallets: {
					createOnLogin: "users-without-wallets",
				},
				loginMethods: ["wallet", "email"],
			}}
		>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<QueryClientProvider client={queryClient}>
					{children}
					<ReactQueryDevtools />
				</QueryClientProvider>
				<Toaster richColors />
			</ThemeProvider>
		</PrivyProvider>
	);
}
