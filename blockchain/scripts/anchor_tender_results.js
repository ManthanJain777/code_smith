const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Anchoring with account:", deployer.address);

  const Contract = await hre.ethers.getContractFactory("ComplianceAuditLedger");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log("ComplianceAuditLedger deployed to:", contractAddress);

  // Canonical payload for Tender Results publication
  const tenderId = "TND-GEM-2026-001";
  const eventType = "TENDER_RESULT_PUBLISHED";
  const actorId = "officer.sharma@gem.gov.in";
  const rankData = "L1:Apex Solutions(91.2%)-L2:Johnson Solutions(74.5%)-L3:St. John Technologies(58.0%)";
  const payload = `${tenderId}:${eventType}:${actorId}:${rankData}`;
  const eventHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(payload));

  console.log("Anchoring payload:", payload);
  console.log("Computed keccak256 eventHash:", eventHash);

  const tx = await contract.anchorEvent(eventHash, eventType, actorId);
  const receipt = await tx.wait();

  console.log("Transaction Hash:", tx.hash);
  console.log("Block Number:", receipt.blockNumber);
  console.log("Gas Used:", receipt.gasUsed.toString());

  const isVerified = await contract.verify(eventHash);
  console.log("On-Chain Verification Status:", isVerified ? "VERIFIED_UNALTERED" : "FAILED");

  const entry = await contract.getEntry(eventHash);
  console.log("Stored Event Details:", {
    eventType: entry[0],
    actorId: entry[1],
    timestamp: new Date(Number(entry[2]) * 1000).toISOString(),
    exists: entry[3]
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
