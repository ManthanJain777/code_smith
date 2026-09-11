const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ComplianceAuditLedger with account:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const Contract = await ethers.getContractFactory("ComplianceAuditLedger");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("ComplianceAuditLedger deployed to:", address);

  // Save deployment info for backend use
  const deployInfo = {
    contractAddress: address,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    abi: JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../artifacts/contracts/ComplianceAuditLedger.sol/ComplianceAuditLedger.json")
      )
    ).abi,
  };

  const outPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(outPath, JSON.stringify(deployInfo, null, 2));
  console.log("Deployment info saved to:", outPath);

  // Also write to backend resources for auto-loading
  const backendPath = path.join(__dirname, "../../backend/src/main/resources/blockchain-deployment.json");
  try {
    fs.writeFileSync(backendPath, JSON.stringify({ contractAddress: address, network: hre.network.name }, null, 2));
    console.log("Backend config updated:", backendPath);
  } catch (e) {
    console.warn("Could not update backend config:", e.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
