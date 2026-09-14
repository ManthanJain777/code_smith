package com.gem.compliance.domain;

import org.junit.jupiter.api.Test;

import java.time.ZonedDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class ContradictionResolutionTest {

    @Test
    void testContradictionResolutionBuilderAndState() {
        ZonedDateTime now = ZonedDateTime.now();
        ContradictionResolution resolution = ContradictionResolution.builder()
            .id("CR-001")
            .bidId("BID-APEX-001")
            .requirementId("REQ-FIN-001")
            .precedentDocument("AUDITED_BALANCE_SHEET")
            .rationale("Audited balance sheet takes statutory precedence under GeM Clause 4.8")
            .resolvedBy("USR-REV-001")
            .resolvedAt(now)
            .txHash("0x1234567890abcdef1234567890abcdef12345678")
            .blockNumber(10042L)
            .build();

        assertNotNull(resolution);
        assertEquals("CR-001", resolution.getId());
        assertEquals("BID-APEX-001", resolution.getBidId());
        assertEquals("REQ-FIN-001", resolution.getRequirementId());
        assertEquals("AUDITED_BALANCE_SHEET", resolution.getPrecedentDocument());
        assertEquals("USR-REV-001", resolution.getResolvedBy());
        assertEquals("0x1234567890abcdef1234567890abcdef12345678", resolution.getTxHash());
        assertEquals(10042L, resolution.getBlockNumber());
    }
}
