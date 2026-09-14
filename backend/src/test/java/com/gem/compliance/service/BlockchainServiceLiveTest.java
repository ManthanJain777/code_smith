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

        assertNotNull(liveBlock, "Should connect to live Hardhat node on port 8545");
        assertTrue(liveBlock >= 1L, "Live block number should be positive on running Hardhat node");

        String txHash = "0xfa929e4af3d655f0037f44dfec143c4aaf97b0d93a7b2aa6d361631f62a7802a";
        var proof = blockchainService.verifyEvent(txHash);

        System.out.println("Verified Proof: " + proof);
        assertTrue(proof.verified());
        assertEquals(txHash, proof.txHash());
        assertTrue(proof.blockNumber() >= 1L);
        assertTrue(proof.network().contains("EVM Chain ID: 31337"));
    }
}
