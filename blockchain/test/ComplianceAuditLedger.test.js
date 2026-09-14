const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ComplianceAuditLedger", function () {
  let contract;
  let owner;
  let nonOwner;

  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("ComplianceAuditLedger");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  it("Should set the correct owner", async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should anchor an event and verify it", async function () {
    const eventHash = ethers.keccak256(ethers.toUtf8Bytes("AUD-001:TENDER_CREATED:USR-PROC-01:1694400000"));
    await contract.anchorEvent(eventHash, "TENDER_CREATED", "USR-PROC-01");
    expect(await contract.verify(eventHash)).to.be.true;
  });

  it("Should return event details", async function () {
    const eventHash = ethers.keccak256(ethers.toUtf8Bytes("AUD-002:DOC_UPLOADED:USR-PROC-01"));
    await contract.anchorEvent(eventHash, "DOC_UPLOADED", "USR-PROC-01");
    const [eventType, actorId, timestamp, exists] = await contract.getEntry(eventHash);
    expect(eventType).to.equal("DOC_UPLOADED");
    expect(actorId).to.equal("USR-PROC-01");
    expect(exists).to.be.true;
  });

  it("Should reject duplicate event anchoring", async function () {
    const eventHash = ethers.keccak256(ethers.toUtf8Bytes("AUD-003:COMPLIANCE_RESULT"));
    await contract.anchorEvent(eventHash, "COMPLIANCE_RESULT", "SYSTEM");
    await expect(
      contract.anchorEvent(eventHash, "COMPLIANCE_RESULT", "SYSTEM")
    ).to.be.revertedWith("ComplianceAuditLedger: event already anchored");
  });

  it("Should reject anchoring from non-owner", async function () {
    const eventHash = ethers.keccak256(ethers.toUtf8Bytes("AUD-004:OVERRIDE"));
    await expect(
      contract.connect(nonOwner).anchorEvent(eventHash, "OVERRIDE", "USR-OTHER")
    ).to.be.revertedWith("ComplianceAuditLedger: caller is not owner");
  });

  it("Should track total events count", async function () {
    expect(await contract.totalEvents()).to.equal(0);
    const h1 = ethers.keccak256(ethers.toUtf8Bytes("event1"));
    const h2 = ethers.keccak256(ethers.toUtf8Bytes("event2"));
    await contract.anchorEvent(h1, "EVENT_1", "SYSTEM");
    await contract.anchorEvent(h2, "EVENT_2", "SYSTEM");
    expect(await contract.totalEvents()).to.equal(2);
  });

  it("Should reject empty eventType", async function () {
    const eventHash = ethers.keccak256(ethers.toUtf8Bytes("AUD-EMPTY-TYPE"));
    await expect(
      contract.anchorEvent(eventHash, "", "USR-OFFICER-01")
    ).to.be.revertedWith("ComplianceAuditLedger: empty eventType");
  });

  it("Should reject empty actorId", async function () {
    const eventHash = ethers.keccak256(ethers.toUtf8Bytes("AUD-EMPTY-ACTOR"));
    await expect(
      contract.anchorEvent(eventHash, "TENDER_CREATED", "")
    ).to.be.revertedWith("ComplianceAuditLedger: empty actorId");
  });
});
