package com.gem.compliance.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class BlockchainServiceLiveTest {

    @Test
    @DisplayName("Verify live round-trip against persistent Hardhat EVM node on port 8545")
    void testLiveHardhatRoundTrip() {
        BlockchainService blockchainService = new BlockchainService();
        ReflectionTestUtils.setField(blockchainService, "blockchainEnabled", true);
        ReflectionTestUtils.setField(blockchainService, "rpcUrl", "http://127.0.0.1:8545");

        Long liveBlock = blockchainService.queryLiveBlockNumber();
        System.out.println("Live Block from Hardhat Node: " + liveBlock);

        org.junit.jupiter.api.Assumptions.assumeTrue(liveBlock != null, 
            "Hardhat node is not running on port 8545; skipping live node RPC test");
        assertTrue(liveBlock >= 1L, "Live block number should be positive on running Hardhat node");

        // Anchor an event to produce a genuine receipt
        var receipt = blockchainService.anchorAuditEventSync(
            "AUD-LIVE-001",
            "COMPLIANCE_EVALUATION",
            "USR-OFFICER-01"
        );
        assertNotNull(receipt, "Anchor receipt must be generated");
        assertNotNull(receipt.txHash(), "Anchor receipt must contain a txHash");

        // Verify the genuinely anchored event
        var proof = blockchainService.verifyEvent(receipt.txHash());
        System.out.println("Verified Proof for anchored event: " + proof);
        assertTrue(proof.verified(), "Anchored event must verify successfully");
        assertEquals(receipt.txHash(), proof.txHash());
        assertTrue(proof.blockNumber() >= 1L);
    }

    @Test
    @DisplayName("Fix F-12 & Critical 05: Verify that arbitrary sufficiently-long hex hash is strictly REJECTED")
    void testArbitraryHexHashRejectedAsUnverified() {
        BlockchainService blockchainService = new BlockchainService();
        ReflectionTestUtils.setField(blockchainService, "blockchainEnabled", false);

        // Arbitrary 66-character valid hex string
        String unanchoredHash = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
        var proof = blockchainService.verifyEvent(unanchoredHash);

        System.out.println("Proof for arbitrary unanchored hash: " + proof);
        assertFalse(proof.verified(), "Arbitrary unanchored hex hash must NEVER be marked verified");
        assertEquals("UNVERIFIED", proof.status(), "Proof status must be explicitly UNVERIFIED");
        assertNull(proof.blockNumber(), "Block number must be null for unverified event");
    }
}
