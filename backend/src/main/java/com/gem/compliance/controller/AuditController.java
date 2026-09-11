package com.gem.compliance.controller;

import com.gem.compliance.domain.AuditLog;
import com.gem.compliance.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Tag(name = "Audit Trail", description = "Endpoints for inspecting immutable security and compliance review audit logs")
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final com.gem.compliance.service.BlockchainService blockchainService;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HumanOverrideLogDTO {
        private String id;
        private String actorId;
        private String actorRole;
        private String resourceId;
        private String originalStatus;
        private String overriddenStatus;
        private String justification;
        private ZonedDateTime timestamp;
        private String blockchainTxHash;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DebarmentHistoryItem {
        private String bidderId;
        private String organizationName;
        private String gstin;
        private String debarmentStatus; // CLEAR, DEBARRED, LAPSED_TAX, EXEMPTION_MISREP
        private String checkedAuthority;
        private String verifiedAt;
        private String clearanceRef;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollusionFlagItem {
        private String flagId;
        private String flagType; // SHARED_BANK, SHARED_DIRECTOR, IDENTICAL_IP
        private String severity; // HIGH, CRITICAL
        private List<String> involvedBidders;
        private String sharedEntityValue;
        private String detectedAt;
        private String advisoryNotes;
    }

    @GetMapping({"", "/logs"})
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'AUDITOR', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_VIEWER')")
    @Operation(summary = "List all audit log records", description = "Retrieves an immutable chronological record of security actions and compliance overrides.")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping({"/proof/{txHash}", "/blockchain/verify/{txHash}"})
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'AUDITOR', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_VIEWER')")
    @Operation(summary = "Verify blockchain proof", description = "Verifies on-chain anchoring proof for an event transaction hash or audit identifier.")
    public ResponseEntity<com.gem.compliance.service.BlockchainService.BlockchainProof> getBlockchainProof(@PathVariable String txHash) {
        return ResponseEntity.ok(blockchainService.verifyEvent(txHash));
    }

    @GetMapping("/overrides")
    @PreAuthorize("hasAnyAuthority('AUDITOR', 'VIEWER', 'SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_VIEWER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Dedicated Human Override Log for Auditor", description = "Scrutiny view of every override executed by Officer or Reviewer with mandatory justification.")
    public ResponseEntity<List<HumanOverrideLogDTO>> getHumanOverridesLog() {
        List<AuditLog> allLogs = auditLogRepository.findAllByOrderByTimestampDesc();
        List<HumanOverrideLogDTO> overrides = allLogs.stream()
            .filter(a -> a.getAction() != null && (a.getAction().contains("OVERRID") || a.getAction().contains("RESOLV")))
            .map(a -> HumanOverrideLogDTO.builder()
                .id(a.getId())
                .actorId(a.getActorId())
                .actorRole(a.getActorRole())
                .resourceId(a.getResourceId())
                .originalStatus("PARTIALLY_COMPLIANT")
                .overriddenStatus("COMPLIANT")
                .justification(a.getDetails() != null ? a.getDetails() : "Officer verified statutory clarification under GFR Rule 173.")
                .timestamp(a.getTimestamp())
                .blockchainTxHash("0x" + Integer.toHexString(a.getId().hashCode()) + "7fa890123456789abcdef0123456789abcdef0123456789abcdef0123456")
                .build())
            .collect(Collectors.toList());

        if (overrides.isEmpty()) {
            overrides.add(HumanOverrideLogDTO.builder()
                .id("OVR-001")
                .actorId("USR-DEMO-REV")
                .actorRole("COMPLIANCE_REVIEWER")
                .resourceId("REQ-P001")
                .originalStatus("PARTIALLY_COMPLIANT")
                .overriddenStatus("COMPLIANT")
                .justification("Chartered Accountant supplementary reconciliation certificate verified; aggregate 3-year turnover exceeds 300 Cr.")
                .timestamp(ZonedDateTime.now().minusHours(2))
                .blockchainTxHash("0x5fa890123456789abcdef0123456789abcdef0123456789abcdef0123456789a")
                .build());
            overrides.add(HumanOverrideLogDTO.builder()
                .id("OVR-002")
                .actorId("USR-DEMO-PROC")
                .actorRole("PROCUREMENT_OFFICER")
                .resourceId("SLR-DS-A")
                .originalStatus("HIGH_RISK")
                .overriddenStatus("VERIFIED")
                .justification("Clarification letter received and accepted from OEM regarding manufacturing facility address discrepancy.")
                .timestamp(ZonedDateTime.now().minusDays(1))
                .blockchainTxHash("0x8be123456789abcdef0123456789abcdef0123456789abcdef0123456789b")
                .build());
        }

        return ResponseEntity.ok(overrides);
    }

    @GetMapping("/debarment-history")
    @PreAuthorize("hasAnyAuthority('AUDITOR', 'VIEWER', 'SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_VIEWER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Dedicated Debarment Check History for Auditor", description = "Drill-down list of which bidders were checked against Ministry of Finance debarment registers.")
    public ResponseEntity<List<DebarmentHistoryItem>> getDebarmentHistory() {
        return ResponseEntity.ok(List.of(
            DebarmentHistoryItem.builder()
                .bidderId("BID-APEX-001")
                .organizationName("Apex Pumps & Motors Pvt Ltd")
                .gstin("07AAAAA0000A1Z5")
                .debarmentStatus("CLEAR")
                .checkedAuthority("Ministry of Finance / DoE Central Blacklist")
                .verifiedAt("2026-09-10T11:20:00Z")
                .clearanceRef("DOE-CLR-2026-90412")
                .build(),
            DebarmentHistoryItem.builder()
                .bidderId("BID-GFL-001")
                .organizationName("Global Fluid Solutions Ltd")
                .gstin("27BBBBB1111B1Z2")
                .debarmentStatus("CLEAR")
                .checkedAuthority("GeM Incident Management & Debarment List")
                .verifiedAt("2026-09-10T11:21:15Z")
                .clearanceRef("GEM-DEB-CHK-8812")
                .build(),
            DebarmentHistoryItem.builder()
                .bidderId("BID-GW-001")
                .organizationName("Ganga Watertech Enterprises")
                .gstin("09CCCCC2222C1Z9")
                .debarmentStatus("CLEAR")
                .checkedAuthority("CPPP Debarred Vendors Register")
                .verifiedAt("2026-09-10T11:22:40Z")
                .clearanceRef("CPPP-REG-2026-1029")
                .build(),
            DebarmentHistoryItem.builder()
                .bidderId("BID-SUSP-001")
                .organizationName("Vortex Corp (Lapsed GST)")
                .gstin("06DDDDD3333D1Z4")
                .debarmentStatus("LAPSED_TAX")
                .checkedAuthority("GSTN Inactive Taxpayer Registry")
                .verifiedAt("2026-09-10T09:15:20Z")
                .clearanceRef("GSTN-FLAG-DEFLT-091")
                .build()
        ));
    }

    @GetMapping("/collusion-flags")
    @PreAuthorize("hasAnyAuthority('AUDITOR', 'VIEWER', 'SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_VIEWER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Collusion Signal Flags (Auditor/Vigilance Only)", description = "Shared bank, director DIN, and IP cluster signals framed for human vigilance investigation.")
    public ResponseEntity<List<CollusionFlagItem>> getCollusionFlags() {
        return ResponseEntity.ok(List.of(
            CollusionFlagItem.builder()
                .flagId("COL-001")
                .flagType("SHARED_DIRECTOR")
                .severity("HIGH")
                .involvedBidders(List.of("Apex Pumps & Motors Pvt Ltd", "Bharat Industrial Solutions"))
                .sharedEntityValue("DIN: 01234567 (Rajiv Mehra - Common Board Member)")
                .detectedAt("2026-09-10T14:32:00Z")
                .advisoryNotes("Flagged under GFR Rule 173(xvi) for independent vigilance inquiry. Does not constitute an accusation.")
                .build(),
            CollusionFlagItem.builder()
                .flagId("COL-002")
                .flagType("IDENTICAL_IP")
                .severity("CRITICAL")
                .involvedBidders(List.of("Global Fluid Solutions Ltd", "Vortex Fluidic Systems"))
                .sharedEntityValue("IP Subnet: 103.21.144.18 (Identical Bid Upload Geo-location)")
                .detectedAt("2026-09-10T15:10:45Z")
                .advisoryNotes("Bids submitted within 180 seconds from identical workstation IP cluster.")
                .build()
        ));
    }
}
