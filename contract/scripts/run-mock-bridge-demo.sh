#!/bin/bash

# Run Mock Bridge Demo Script
# This script demonstrates the mock CCTP bridge functionality

echo "==================================="
echo "  Mock CCTP Bridge Demo Runner"
echo "==================================="
echo ""

# Check if we're in the contract directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must be run from the contract directory"
  exit 1
fi

# Ensure dependencies are installed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

# Build the bridge SDK if needed
echo "🔨 Building bridge SDK..."
cd ../bridge && pnpm build && cd ../contract

# Set environment variable for mock mode
export BRIDGE_MODE=mock
export CCTP_MOCK_MODE=true

echo ""
echo "🚀 Running Mock Bridge Demo..."
echo ""

# Run the demo
pnpm exec ts-node examples/mock-bridge-demo.ts

echo ""
echo "==================================="
echo "  Demo completed!"
echo "==================================="
