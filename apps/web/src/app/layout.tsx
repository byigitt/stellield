import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "@fontsource/host-grotesk/400.css";
import "@fontsource/host-grotesk/500.css";
import "@fontsource/host-grotesk/600.css";
import "@fontsource/host-grotesk/700.css";
import "@fontsource/host-grotesk/800.css";
import "../index.css";
import Providers from "@/components/providers";
import HeaderWrapper from "@/components/header-wrapper";

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Stellar Yield Aggregator",
	description: "AI-Powered Yield Discovery and Risk Analysis for Stellar Network",
	icons: {
		icon: "/logo-main.png",
		apple: "/logo-main.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className="dark">
			<body
				className={`${geistMono.variable} antialiased dark`}
			>
				<Providers>
					<div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#151932] to-[#1a1f3a]">
						<HeaderWrapper />
						{children}
					</div>
				</Providers>
			</body>
		</html>
	);
}
