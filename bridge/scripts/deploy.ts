import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy CCTP Bridge contracts to Sepolia testnet
 */
async function main() {
  console.log("=== Deploying CCTP Bridge to Sepolia ===\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Ethereum Sepolia domain ID (11155111 chainId -> domain 0 for testnet)
  const LOCAL_DOMAIN = 0;

  // Step 1: Deploy MockUSDC
  console.log("1. Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ MockUSDC deployed to:", usdcAddress);
  console.log("   Initial supply:", ethers.formatUnits(await usdc.totalSupply(), 6), "USDC\n");

  // Step 2: Deploy MessageTransmitter
  console.log("2. Deploying MessageTransmitter...");
  const MessageTransmitter = await ethers.getContractFactory("MessageTransmitter");
  const messageTransmitter = await MessageTransmitter.deploy(LOCAL_DOMAIN);
  await messageTransmitter.waitForDeployment();
  const messageTransmitterAddress = await messageTransmitter.getAddress();
  console.log("✅ MessageTransmitter deployed to:", messageTransmitterAddress);
  console.log("   Local domain:", LOCAL_DOMAIN, "\n");

  // Step 3: Deploy TokenMessenger
  console.log("3. Deploying TokenMessenger...");
  const TokenMessenger = await ethers.getContractFactory("TokenMessenger");
  const tokenMessenger = await TokenMessenger.deploy(
    messageTransmitterAddress,
    usdcAddress
  );
  await tokenMessenger.waitForDeployment();
  const tokenMessengerAddress = await tokenMessenger.getAddress();
  console.log("✅ TokenMessenger deployed to:", tokenMessengerAddress, "\n");

  // Step 4: Transfer some USDC to TokenMessenger (for minting on destination)
  console.log("4. Funding TokenMessenger with USDC...");
  const fundAmount = ethers.parseUnits("100000", 6); // 100k USDC
  const tx = await usdc.transfer(tokenMessengerAddress, fundAmount);
  await tx.wait();
  console.log("✅ Transferred", ethers.formatUnits(fundAmount, 6), "USDC to TokenMessenger\n");

  // Step 5: Save deployment addresses
  const deployment = {
    network: "sepolia",
    chainId: 11155111,
    domain: LOCAL_DOMAIN,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      MockUSDC: usdcAddress,
      MessageTransmitter: messageTransmitterAddress,
      TokenMessenger: tokenMessengerAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "sepolia.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));
  console.log("✅ Deployment info saved to:", deploymentFile, "\n");

  // Print summary
  console.log("=== Deployment Complete ===");
  console.log("Network:             Sepolia Testnet");
  console.log("Chain ID:            11155111");
  console.log("Domain:              ", LOCAL_DOMAIN);
  console.log("\nContract Addresses:");
  console.log("MockUSDC:            ", usdcAddress);
  console.log("MessageTransmitter:  ", messageTransmitterAddress);
  console.log("TokenMessenger:      ", tokenMessengerAddress);
  console.log("\nNext Steps:");
  console.log("1. Verify contracts on Etherscan:");
  console.log("   npx hardhat verify --network sepolia", usdcAddress);
  console.log("   npx hardhat verify --network sepolia", messageTransmitterAddress, LOCAL_DOMAIN);
  console.log("   npx hardhat verify --network sepolia", tokenMessengerAddress, messageTransmitterAddress, usdcAddress);
  console.log("\n2. Configure remote TokenMessengers for cross-chain transfers");
  console.log("3. Update .env with contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
