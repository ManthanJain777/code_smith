package com.gem.compliance.controller;

import com.gem.compliance.dto.ComplianceResultDTO;
import com.gem.compliance.dto.HumanReviewRequest;
import com.gem.compliance.service.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Compliance & Human Review", description = "Endpoints for retrieving compliance evaluation matrix and executing human overrides")
public class ComplianceController {

    private final ComplianceService complianceService;

    @GetMapping("/compliance/bid/{bidId}")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'AUDITOR', 'BIDDER_VENDOR', 'BIDDER', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_BIDDER_VENDOR', 'ROLE_BIDDER', 'ROLE_VIEWER')")
    @Operation(summary = "Get compliance matrix for a bid", description = "Retrieves all 5-state compliance verification results for a given bid ID.")
    public ResponseEntity<List<ComplianceResultDTO>> getComplianceResults(@PathVariable String bidId) {
        return ResponseEntity.ok(complianceService.getResultsByBidId(bidId));
    }

    @PostMapping("/reviews/override")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Submit human reviewer decision / override", description = "Allows a procurement officer to approve or override an AI compliance result with auditable notes.")
    public ResponseEntity<ComplianceResultDTO> overrideComplianceResult(@Valid @RequestBody HumanReviewRequest request) {
        ComplianceResultDTO updated = complianceService.processHumanReview(request);
        return ResponseEntity.ok(updated);
    }
}
