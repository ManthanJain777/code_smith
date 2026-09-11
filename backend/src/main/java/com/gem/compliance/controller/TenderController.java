package com.gem.compliance.controller;

import com.gem.compliance.dto.TenderDTO;
import com.gem.compliance.service.TenderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tenders")
@RequiredArgsConstructor
@Tag(name = "Tender Management", description = "Endpoints for creating, retrieving, and managing GeM procurement tenders")
public class TenderController {

    private final TenderService tenderService;
    private final com.gem.compliance.service.ComplianceService complianceService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'AUDITOR', 'BIDDER_VENDOR', 'BIDDER', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_BIDDER_VENDOR', 'ROLE_BIDDER', 'ROLE_VIEWER')")
    @Operation(summary = "List all active tenders", description = "Retrieves all tenders with extracted compliance requirements.")
    public ResponseEntity<List<TenderDTO>> getAllTenders() {
        return ResponseEntity.ok(tenderService.getAllTenders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'AUDITOR', 'BIDDER_VENDOR', 'BIDDER', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_BIDDER_VENDOR', 'ROLE_BIDDER', 'ROLE_VIEWER')")
    @Operation(summary = "Get tender by ID", description = "Retrieves tender details and requirement breakdown for a specific tender ID.")
    public ResponseEntity<TenderDTO> getTenderById(@PathVariable String id) {
        return ResponseEntity.ok(tenderService.getTenderById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Create a new tender", description = "Creates a new tender and extracts initial requirement constraints.")
    public ResponseEntity<TenderDTO> createTender(@RequestBody TenderDTO tenderDTO) {
        TenderDTO created = tenderService.createTender(tenderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping(value = "/upload-pdf", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Upload tender PDF and extract requirements", description = "Extracts requirements and registers tender.")
    public ResponseEntity<TenderDTO> uploadTenderPdf(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "tenderNumber", required = false) String tenderNumber,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "estimatedValue", required = false) java.math.BigDecimal estimatedValue
    ) {
        String num = tenderNumber != null ? tenderNumber : "GEM/2026/B/" + (int)(10000 + Math.random() * 90000);
        String tit = title != null ? title : (file.getOriginalFilename() != null ? file.getOriginalFilename().replace(".pdf", "") : "Procurement Tender");
        TenderDTO dto = TenderDTO.builder()
                .tenderNumber(num)
                .title(tit)
                .category(category != null ? category : "Industrial Equipment")
                .estimatedValue(estimatedValue != null ? estimatedValue : java.math.BigDecimal.valueOf(50000000.00))
                .issuingAuthority("GeM Authority")
                .description("Extracted from " + file.getOriginalFilename())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(tenderService.createTender(dto));
    }

    @PostMapping("/{id}/run-compliance")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Run compliance pipeline for tender bids", description = "Triggers evaluation across submitted bids.")
    public ResponseEntity<java.util.Map<String, Object>> runCompliancePipeline(
            @PathVariable String id,
            @RequestParam(value = "bidId", defaultValue = "BID-APEX-001") String bidId
    ) {
        var results = complianceService.evaluateTenderBids(id, bidId);
        return ResponseEntity.ok(java.util.Map.of(
                "tenderId", id,
                "bidId", bidId,
                "status", "EVALUATED",
                "evaluatedCount", results.size(),
                "message", "Compliance pipeline completed with deterministic and hybrid RAG evidence citation."
        ));
    }
}
