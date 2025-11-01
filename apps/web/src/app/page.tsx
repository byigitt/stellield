"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Key, TrendingUp, Sparkles, Database, Network, Zap, ChevronDown, ArrowRight, Check, Github, ExternalLink } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        {/* Curved light effect at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent" style={{
          clipPath: "ellipse(80% 100% at 50% 100%)"
        }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 text-sm text-blue-300">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Stellar Network</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="text-white">The Decentralized</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
                Fixed Income Layer
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Unlock sustainable yields on Stellar with AI-powered aggregation
              <br />
              from everywhere, into one simple platform.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 h-14 text-lg">
                  Launch App
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="glass-panel border-white/10 hover:bg-white/5 h-14 px-8 text-lg">
                Learn More
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24">
              <div className="glass-card p-6 rounded-2xl">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">9.4%</div>
                <div className="text-sm text-gray-400">Average APY</div>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">$120M</div>
                <div className="text-sm text-gray-400">Total Value</div>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">4,988,537.10</div>
                <div className="text-sm text-gray-400">LST Staked</div>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">$2,562</div>
                <div className="text-sm text-gray-400">Per Holder</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ChevronDown className="w-6 h-6 text-gray-400 animate-bounce" />
        </div>
      </section>

      {/* Treehouse Ecosystem Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Stellar Ecosystem
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A comprehensive DeFi infrastructure built on Stellar, connecting liquidity,
              <br />
              staking, lending, and yield optimization in one unified platform.
            </p>
            <Button className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Explore Ecosystem
            </Button>
          </div>

          {/* Central Token Visual */}
          <div className="relative max-w-2xl mx-auto my-20">
            <div className="relative w-64 h-64 mx-auto">
              {/* Central coin */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 blur-3xl" />
            </div>

            {/* Ecosystem features around the token */}
            <div className="grid grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                  <Network className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Liquidity</h3>
                <p className="text-sm text-gray-400">Deep liquidity pools</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Staking</h3>
                <p className="text-sm text-gray-400">Secure validation</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Yields</h3>
                <p className="text-sm text-gray-400">Optimized returns</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earn Real Yield Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Earn Real Yield with{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                LST
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Maximize your returns through liquid staking tokens with compounding rewards
              <br />
              and full liquidity across the Stellar ecosystem.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="relative max-w-5xl mx-auto">
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Curved connection lines */}
              <path
                d="M 150 100 Q 250 150, 350 100"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="glass-card p-8 rounded-2xl text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Deposit Assets</h3>
                <p className="text-gray-400">
                  Start earning by depositing XLM or other supported assets
                </p>
              </div>

              <div className="glass-card p-8 rounded-2xl text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Auto-Compound</h3>
                <p className="text-gray-400">
                  Rewards automatically compound for maximum efficiency
                </p>
              </div>

              <div className="glass-card p-8 rounded-2xl text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Earn Yield</h3>
                <p className="text-gray-400">
                  Receive sustainable yields from multiple sources
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LST 2.0 Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              LST 2.0: Put Your Assets to Work
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Next-generation liquid staking with enhanced capital efficiency
              <br />
              and seamless DeFi integration across Stellar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Stake Card */}
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-400/30 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Stake</h3>
                <p className="text-gray-400 mb-6">
                  Stake your XLM and receive liquid staking tokens (LST) instantly. 
                  Your assets remain liquid while earning rewards.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Instant LST minting</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>No lock-up periods</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Maintain full liquidity</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Earn Card */}
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/30 border border-purple-400/30 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Earn</h3>
                <p className="text-gray-400 mb-6">
                  Earn yield from multiple sources: staking rewards, DeFi protocols,
                  and lending pools. Rewards auto-compound daily.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Multi-source yields</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Auto-compounding</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Real-time tracking</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Hub Card */}
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-400/30 flex items-center justify-center">
                  <Network className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Hub</h3>
                <p className="text-gray-400 mb-6">
                  Connect to multiple DeFi protocols across Stellar. Use your LST
                  as collateral or provide liquidity seamlessly.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Cross-protocol integration</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>LST as collateral</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Unified dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Best-in-Class Security
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Your assets are protected by multiple layers of security,
              <br />
              audited smart contracts, and battle-tested infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="glass-panel p-6 rounded-xl">
              <Shield className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Audited Code</h3>
              <p className="text-sm text-gray-400">
                Smart contracts audited by leading security firms
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <Lock className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Encrypted Data</h3>
              <p className="text-sm text-gray-400">
                End-to-end encryption for all sensitive data
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <Key className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Multi-Sig</h3>
              <p className="text-sm text-gray-400">
                Multi-signature wallets for treasury management
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <Shield className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Insurance</h3>
              <p className="text-sm text-gray-400">
                Protocol insurance for additional protection
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <Database className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Decentralized</h3>
              <p className="text-sm text-gray-400">
                Non-custodial architecture, you control your keys
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <Zap className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-gray-400">
                24/7 monitoring and alerting systems
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Principles Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Key Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30 flex items-center justify-center backdrop-blur-xl">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Accuracy</h3>
              <p className="text-gray-400">
                Real-time data and precise calculations ensure you always have accurate yield information
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30 flex items-center justify-center backdrop-blur-xl">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Network className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Decentralization</h3>
              <p className="text-gray-400">
                Built on trustless smart contracts with no single point of failure or control
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-400/30 flex items-center justify-center backdrop-blur-xl">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Aggregation</h3>
              <p className="text-gray-400">
                Access yields from multiple protocols and strategies through a single interface
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-12 text-center">
              FAQ
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="glass-panel rounded-xl px-6 border-white/5">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  How does Stellar Yield Aggregator work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Our platform aggregates yield opportunities from multiple DeFi protocols on Stellar,
                  automatically optimizing your returns while maintaining full transparency and security.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="glass-panel rounded-xl px-6 border-white/5">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  What are the risks involved?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Like all DeFi protocols, there are smart contract risks, market volatility, and impermanent loss
                  in liquidity pools. We mitigate these through audits, insurance, and diversification strategies.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="glass-panel rounded-xl px-6 border-white/5">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  Can I withdraw my assets anytime?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Yes, your assets remain liquid. You can withdraw at any time, though some strategies may have
                  optimal withdrawal windows to maximize returns and minimize fees.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="glass-panel rounded-xl px-6 border-white/5">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  How are yields calculated?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Yields are calculated from multiple sources including staking rewards, lending interest, liquidity
                  pool fees, and protocol incentives. All yields are displayed as APY (Annual Percentage Yield).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Backed By Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Backed By
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {[
              "StellarOrg",
              "Lightcurve",
              "Stellar Development Foundation",
              "Meridian",
              "Ultra Capital",
              "SoroVerse",
              "SettleNetwork",
              "DeFi Collective",
              "Stellar Labs",
              "Validators"
            ].map((partner) => (
              <div
                key={partner}
                className="glass-panel p-6 rounded-xl flex items-center justify-center h-24 hover:bg-white/5 transition-colors"
              >
                <span className="text-gray-400 font-medium text-sm text-center">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-white">Stellar</span>
                  <span className="text-xs text-gray-400 -mt-1">Yield Aggregator</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                The decentralized fixed income layer for Stellar Network.
              </p>
              <div className="flex items-center space-x-2">
                <Link
                  href="https://x.com"
                  className="w-9 h-9 rounded-lg glass-panel flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="https://discord.com"
                  className="w-9 h-9 rounded-lg glass-panel flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <DiscordIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="https://github.com"
                  className="w-9 h-9 rounded-lg glass-panel flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-white font-semibold mb-4">Products</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Yield Aggregator
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Liquid Staking
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Risk Analytics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Security Audits
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Brand Assets
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 Stellar Yield Aggregator. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
