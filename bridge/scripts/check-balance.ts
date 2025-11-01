import { ethers } from "hardhat";

/**
 * Check Ethereum wallet balance on Sepolia
 */
async function main() {
  console.log("=== Checking Ethereum Balance ===\n");
  console.log("Connecting to network...");

  try {
    const [signer] = await ethers.getSigners();
    const address = await signer.getAddress();

    console.log("Fetching balance...");
    const balance = await ethers.provider.getBalance(address);
    const network = await ethers.provider.getNetwork();

    console.log("\n✅ Connected!");
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId.toString());
    console.log("\nWallet Address:", address);
    console.log("ETH Balance:", ethers.formatEther(balance), "ETH");

  // Check if balance is sufficient for deployment
  const minBalance = ethers.parseEther("0.05"); // Need at least 0.05 ETH

  if (balance === 0n) {
    console.log("\n❌ No balance found!");
    console.log("\n📍 Get Sepolia ETH from faucets:");
    console.log("   • https://sepoliafaucet.com/");
    console.log("   • https://www.infura.io/faucet/sepolia");
    console.log("   • https://faucet.quicknode.com/ethereum/sepolia");
  } else if (balance < minBalance) {
    console.log("\n⚠️  Balance is low!");
    console.log("   Recommended: at least 0.05 ETH for deployment");
    console.log("   Get more from: https://sepoliafaucet.com/");
  } else {
    console.log("\n✅ Balance is sufficient for deployment!");
    console.log("   You can proceed with: pnpm deploy:sepolia");
  }

    console.log("\n================================");
  } catch (error: any) {
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error("\n❌ Connection timeout!");
      console.error("The RPC endpoint is too slow or unavailable.");
      console.error("\n💡 Solutions:");
      console.error("1. Get a free RPC from Alchemy: https://www.alchemy.com/");
      console.error("2. Try another RPC in .env:");
      console.error("   ETHEREUM_RPC_URL=https://rpc2.sepolia.org");
      console.error("   ETHEREUM_RPC_URL=https://sepolia.drpc.org");
    } else {
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    if (error.code) console.error("Error code:", error.code);
    process.exit(1);
  });
