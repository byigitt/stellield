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
import Image from "next/image";

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
    <div className="min-h-screen bg-black landing-grid-overlay">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-16 pt-16 bg-black">
        {/* Background Image with Shadow Effects */}
        <div className="absolute inset-0 -top-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-black"></div>
          <div 
            className="absolute inset-0 opacity-60 blur-md scale-105"
            style={{
              backgroundImage: 'url(/landing-page-bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Enhanced shadow layers */}
          <div className="absolute inset-0 shadow-[inset_0_0_200px_100px_rgba(0,0,0,0.9)]"></div>
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black via-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          <div className="absolute left-0 top-0 bottom-0 w-96 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-black via-black/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 text-sm text-blue-300 border border-blue-500/20">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Stellar Network</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">The Decentralized</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fixed Income Layer
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Unlock sustainable yields on Stellar with AI-powered aggregation
              <br />
              from everywhere into one simple platform.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-24">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white px-8 py-4 h-auto text-base font-semibold rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-200">
                  Launch App
                </Button>
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              <div className="glass-card p-4 md:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center min-h-[120px] md:min-h-[140px]">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">9.4%</div>
                <div className="text-xs md:text-sm text-gray-400">Average APY</div>
              </div>
              <div className="glass-card p-4 md:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center min-h-[120px] md:min-h-[140px]">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">$124.68M</div>
                <div className="text-xs md:text-sm text-gray-400">Total Value Locked</div>
              </div>
              <div className="glass-card p-4 md:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center min-h-[120px] md:min-h-[140px]">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">4,988,537</div>
                <div className="text-xs md:text-sm text-gray-400">LST Staked</div>
              </div>
              <div className="glass-card p-4 md:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center min-h-[120px] md:min-h-[140px]">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">$2,562</div>
                <div className="text-xs md:text-sm text-gray-400">Per Holder</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <ChevronDown className="w-6 h-6 text-gray-400 animate-bounce" />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 relative bg-black overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/60 via-black to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Intelligent Yield Discovery
            </h2>
            <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-8">
              Automated discovery of Stellar yield opportunities with AI-powered risk assessment
              and real-time portfolio optimization across DeFi protocols.
            </p>
            <Link href="/dashboard">
              <Button className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white px-8 py-3 h-auto rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-200">
                View Opportunities
              </Button>
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mt-12 md:mt-16">
            <div className="glass-card p-6 md:p-8 rounded-2xl text-center backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-900/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-700/30 backdrop-blur-xl border border-blue-400/40 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Automated Discovery</h3>
              <p className="text-sm text-gray-400">Real-time scanning of Stellar protocols for yield opportunities</p>
            </div>
            
            <div className="glass-card p-6 md:p-8 rounded-2xl text-center backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-900/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-700/30 backdrop-blur-xl border border-purple-400/40 flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Risk Scoring</h3>
              <p className="text-sm text-gray-400">Multi-dimensional risk analysis with A-D tier ratings</p>
            </div>
            
            <div className="glass-card p-6 md:p-8 rounded-2xl text-center backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-900/5 border border-blue-500/20 hover:border-purple-500/40 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-700/30 backdrop-blur-xl border border-blue-400/40 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">AI Recommendations</h3>
              <p className="text-sm text-gray-400">Machine learning-driven portfolio allocation suggestions</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Process Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-black">
        {/* Background with gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              From Discovery to{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Optimization
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto">
              Our intelligent pipeline continuously monitors Stellar protocols, evaluates risks,
              and delivers actionable insights to maximize your yield potential.
            </p>
          </div>

          {/* Flow visualization with curved connections */}
          <div className="relative max-w-6xl mx-auto">
            {/* SVG for curved connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                  <stop offset="50%" stopColor="rgba(147, 51, 234, 0.5)" />
                  <stop offset="100%" stopColor="rgba(236, 72, 153, 0.3)" />
                </linearGradient>
              </defs>
              {/* Curved connection lines between cards */}
              <path
                d="M 200 150 Q 400 100, 600 150"
                stroke="url(#flowGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M 600 150 Q 800 100, 1000 150"
                stroke="url(#flowGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="glass-card p-8 rounded-2xl text-center backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-900/5 border border-blue-500/20 hover:border-purple-500/40 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Discover</h3>
                <p className="text-gray-400 text-sm">
                  Automated scanning of Stellar protocols using ValidationCloud infrastructure for real-time yield data
                </p>
              </div>

              <div className="glass-card p-8 rounded-2xl text-center backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-900/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Analyze</h3>
                <p className="text-gray-400 text-sm">
                  Multi-dimensional risk scoring across protocol integrity, liquidity, and stability metrics
                </p>
              </div>

              <div className="glass-card p-8 rounded-2xl text-center backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-900/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Optimize</h3>
                <p className="text-gray-400 text-sm">
                  AI-driven portfolio recommendations balancing expected returns with risk tolerance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-black">
        {/* Background with gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Powered by Advanced Technology
            </h2>
            <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto">
              Enterprise-grade infrastructure delivering real-time insights
              with institutional-quality risk management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Real-Time Data Card */}
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-400/30 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Real-Time Data</h3>
                <p className="text-gray-400 mb-6 text-sm">
                  Continuous monitoring via ValidationCloud with updates every 10 minutes
                  to capture the latest yield opportunities.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Live Stellar protocol scanning</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Soroban event tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Horizon API integration</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Risk Management Card */}
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-600/30 border border-purple-400/30 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Risk Tiers</h3>
                <p className="text-gray-400 mb-6 text-sm">
                  Comprehensive scoring across protocol integrity, liquidity depth,
                  performance stability, and operational signals.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>A-D tier classifications</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>ML-enhanced anomaly detection</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Transparent scoring methodology</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bridge Insights Card */}
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-300 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-400/30 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Network className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Cross-Chain Ready</h3>
                <p className="text-gray-400 mb-6 text-sm">
                  Bridge cost and latency estimates for Stellar ↔ Solana opportunities
                  via official Soroban integration.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Multi-chain yield comparison</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Fee & latency transparency</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Optimal route suggestions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-black">
        {/* Background with gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-black to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Best-in-Class Security
            </h2>
            <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto">
              Your assets are protected by multiple layers of security,
              audited smart contracts, and battle-tested infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            <div className="glass-card p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br from-blue-500/5 to-blue-900/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <Shield className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-base md:text-lg font-bold text-white mb-2">Audited Code</h3>
              <p className="text-sm text-gray-400">
                Smart contracts audited by leading security firms
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br from-blue-500/5 to-blue-900/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <Lock className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-base md:text-lg font-bold text-white mb-2">Encrypted Data</h3>
              <p className="text-sm text-gray-400">
                End-to-end encryption for all sensitive data
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br from-blue-500/5 to-blue-900/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <Key className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-base md:text-lg font-bold text-white mb-2">Multi-Sig</h3>
              <p className="text-sm text-gray-400">
                Multi-signature wallets for treasury management
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br from-purple-500/5 to-purple-900/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <Shield className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-base md:text-lg font-bold text-white mb-2">Insurance</h3>
              <p className="text-sm text-gray-400">
                Protocol insurance for additional protection
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br from-purple-500/5 to-purple-900/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <Database className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-base md:text-lg font-bold text-white mb-2">Decentralized</h3>
              <p className="text-sm text-gray-400">
                Non-custodial architecture, you control your keys
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br from-purple-500/5 to-purple-900/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <Zap className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-base md:text-lg font-bold text-white mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-gray-400">
                24/7 monitoring and alerting systems
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Principles Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-black">
        {/* Background with gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-black to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Key Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30 flex items-center justify-center backdrop-blur-xl">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Zap className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Real-Time Intelligence</h3>
              <p className="text-sm md:text-base text-gray-400">
                Automated discovery and analysis with updates every 10 minutes to capture emerging opportunities
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30 flex items-center justify-center backdrop-blur-xl">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Transparency First</h3>
              <p className="text-sm md:text-base text-gray-400">
                Complete visibility into risk scores, data sources, and AI reasoning with no hidden execution
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-400/30 flex items-center justify-center backdrop-blur-xl">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">AI-Powered Insights</h3>
              <p className="text-sm md:text-base text-gray-400">
                Machine learning models deliver portfolio recommendations with confidence scores and explainability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-black">
        {/* Background with gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/25 via-black to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 md:mb-12 text-center">
              FAQ
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="glass-panel rounded-xl px-6 border-white/5">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  How does the platform discover yield opportunities?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  We continuously scan Stellar protocols using ValidationCloud infrastructure, monitoring Horizon APIs and Soroban events 
                  every 10 minutes. Our automated pipeline discovers new opportunities, tracks reward emissions, and evaluates liquidity depth 
                  to provide real-time yield insights across AMMs, lending protocols, and staking programs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="glass-panel rounded-xl px-6 border-white/5">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  What do the risk tiers (A-D) mean?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Our risk scoring evaluates opportunities across five dimensions: Protocol Integrity (35%), Liquidity & Execution (25%), 
                  Performance Stability (15%), Network & Custody (15%), and Operational Signals (10%). Tier A represents the lowest risk 
                  with audited contracts and deep liquidity, while Tier D indicates higher risk requiring careful consideration.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="glass-panel rounded-xl px-6 border-white/5">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  Does the platform automatically execute trades?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  No. We provide insights, risk scores, and AI-powered portfolio recommendations only. You maintain full control and make 
                  all execution decisions. This transparency-first approach ensures you understand every opportunity before acting, 
                  with complete visibility into our methodology and data sources.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="glass-panel rounded-xl px-6 border-white/5">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  How do AI portfolio recommendations work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Our machine learning models analyze historical performance, risk metrics, and correlation patterns to suggest optimal 
                  allocations. Each recommendation includes confidence scores, expected APY projections, and explainability (SHAP summaries) 
                  so you understand the reasoning. Models are continuously backtested and versioned for reliability.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Backed By Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-black">
        {/* Background with gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/30 via-black to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8 md:mb-12 text-center">
            Backed By
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              "StellarOrg",
              "Lightcurve",
              "Stellar Dev Foundation",
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
                className="glass-panel p-4 md:p-6 rounded-xl flex items-center justify-center min-h-[80px] md:min-h-[100px] hover:bg-white/5 transition-colors"
              >
                <span className="text-gray-400 font-medium text-xs md:text-sm text-center">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 mt-12 md:mt-20 overflow-hidden bg-black">
        {/* Background with gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 relative">
                  <Image
                    src="/logo-main.png"
                    alt="Stellield Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-white">Stellield</span>
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
            <p>© 2025 Stellield. All rights reserved.</p>
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
