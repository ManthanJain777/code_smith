package com.gem.compliance.controller;

import com.gem.compliance.domain.AuditLog;
import com.gem.compliance.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Tag(name = "Audit Trail", description = "Endpoints for inspecting immutable security and compliance review audit logs")
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final com.gem.compliance.service.BlockchainService blockchainService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'AUDITOR', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_VIEWER')")
    @Operation(summary = "List all audit log records", description = "Retrieves an immutable chronological record of security actions and compliance overrides.")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/proof/{txHash}")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'AUDITOR', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_VIEWER')")
    @Operation(summary = "Verify blockchain proof", description = "Verifies on-chain anchoring proof for an event transaction hash.")
    public ResponseEntity<com.gem.compliance.service.BlockchainService.BlockchainProof> getBlockchainProof(@PathVariable String txHash) {
        return ResponseEntity.ok(blockchainService.verifyEvent(txHash));
    }
}
