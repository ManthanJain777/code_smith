package com.gem.compliance.controller;

import com.gem.compliance.domain.ComplianceResult;
import com.gem.compliance.domain.ContradictionResolution;
import com.gem.compliance.domain.Review;
import com.gem.compliance.dto.*;
import com.gem.compliance.repository.BidRepository;
import com.gem.compliance.repository.ComplianceResultRepository;
import com.gem.compliance.repository.ContradictionResolutionRepository;
import com.gem.compliance.repository.ReviewRepository;
import com.gem.compliance.service.BlockchainService;
import com.gem.compliance.service.ComplianceService;
import com.gem.compliance.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Compliance & Human Review", description = "Endpoints for retrieving compliance evaluation matrix, risk scores, AI recommendations, contradiction resolutions and executing human overrides")
public class ComplianceController {

    private final ComplianceService complianceService;
    private final UserService userService;
    private final BidRepository bidRepository;
    private final ComplianceResultRepository complianceResultRepository;
    private final ContradictionResolutionRepository contradictionResolutionRepository;
    private final ReviewRepository reviewRepository;
    private final BlockchainService blockchainService;

    @GetMapping({"/compliance/bid/{bidId}", "/compliance/results/{bidId}"})
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'AUDITOR', 'BIDDER_VENDOR', 'BIDDER', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_BIDDER_VENDOR', 'ROLE_BIDDER', 'ROLE_VIEWER')")
    @Operation(summary = "Get compliance matrix for a bid", description = "Retrieves all 5-state compliance verification results for a given bid ID.")
    public ResponseEntity<List<ComplianceResultDTO>> getComplianceResults(@PathVariable String bidId) {
        userService.getCurrentUser().ifPresent(user -> {
            String role = user.getRole() != null ? user.getRole().toUpperCase().replace("ROLE_", "") : "";
            if (role.contains("BIDDER")) {
                bidRepository.findById(bidId).ifPresent(bid -> {
                    boolean isOwnBid = (bid.getBidderEmail() != null && bid.getBidderEmail().equalsIgnoreCase(user.getEmail()))
                        || (user.getOrganizationId() != null && user.getOrganizationId().equalsIgnoreCase(bid.getBidderGstin()));
                    if (!isOwnBid) {
                        throw new org.springframework.security.access.AccessDeniedException(
                            "403 Forbidden: Bidders are strictly prohibited from inspecting competitor bids or compliance data."
                        );
                    }
                });
            }
        });
        return ResponseEntity.ok(complianceService.getResultsByBidId(bidId));
    }

    @GetMapping("/compliance/score/{bidId}")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'AUDITOR', 'BIDDER_VENDOR', 'BIDDER', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_BIDDER_VENDOR', 'ROLE_BIDDER', 'ROLE_VIEWER')")
    @Operation(summary = "Get overall compliance score and risk level for a bid",
               description = "Returns the SIH-mandated compliance score (0-100%), risk level (LOW/MEDIUM/HIGH/CRITICAL), and breakdown of requirement statuses.")
    public ResponseEntity<BidComplianceScoreDTO> getComplianceScore(@PathVariable String bidId) {
        return ResponseEntity.ok(complianceService.calculateBidComplianceScore(bidId));
    }

    @GetMapping("/compliance/recommendation/{bidId}")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'AUDITOR', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN', 'ROLE_AUDITOR', 'ROLE_VIEWER')")
    @Operation(summary = "Get AI-generated recommendation for a bid",
               description = "Returns a structured AI recommendation (RECOMMEND_QUALIFY/RECOMMEND_REJECT/REFER_FOR_REVIEW) with identified gaps and strengths.")
    public ResponseEntity<AiRecommendationDTO> getAiRecommendation(@PathVariable String bidId) {
        return ResponseEntity.ok(complianceService.generateAiRecommendation(bidId));
    }

    @PostMapping({"/reviews/override", "/compliance/override"})
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Submit human reviewer decision / override", description = "Allows a procurement officer or reviewer to approve or override an AI compliance result with mandatory written justification (>=15 chars).")
    public ResponseEntity<ComplianceResultDTO> overrideComplianceResult(@Valid @RequestBody HumanReviewRequest request) {
        ComplianceResultDTO updated = complianceService.processHumanReview(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/compliance/contradictions/resolve")
    @PreAuthorize("hasAnyAuthority('COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(
        summary = "Resolve Cross-Document Contradiction (Reviewer Only)",
        description = "Exclusive action for Compliance Reviewer to select statutory-precedent document, provide formal resolution rationale, and anchor on EVM."
    )
    public ResponseEntity<Map<String, Object>> resolveContradiction(@Valid @RequestBody ContradictionResolveRequest request) {
        String actorId = userService.getCurrentUser().map(u -> u.getId()).orElse("USR-DEMO-REV");
        String resolutionId = "RES-CTR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 1. Synchronously anchor resolution on Ethereum ledger
        BlockchainService.AnchorReceipt receipt = blockchainService.anchorAuditEventSync(
            resolutionId,
            "CONTRADICTION_RESOLVED",
            actorId
        );

        // 2. Persist ContradictionResolution entity in PostgreSQL
        ContradictionResolution resolution = ContradictionResolution.builder()
            .id(resolutionId)
            .bidId(request.getBidId())
            .requirementId(request.getRequirementId())
            .precedentDocument(request.getPrecedentDocumentName() != null ? request.getPrecedentDocumentName() : "AUDITED_BALANCE_SHEET")
            .rationale(request.getRationale())
            .resolvedBy(actorId)
            .resolvedAt(ZonedDateTime.now())
            .txHash(receipt.txHash())
            .blockNumber(receipt.blockNumber())
            .build();
        contradictionResolutionRepository.save(resolution);

        // 3. Update corresponding ComplianceResult status if applicable
        Optional<ComplianceResult> resultOpt = complianceResultRepository.findByRequirementIdAndBidId(request.getRequirementId(), request.getBidId());
        if (resultOpt.isEmpty()) {
            resultOpt = complianceResultRepository.findById(request.getRequirementId());
        }
        resultOpt.ifPresent(cr -> {
            String prec = resolution.getPrecedentDocument().toUpperCase();
            if (prec.contains("BALANCE_SHEET")) {
                cr.setStatus("NON_COMPLIANT");
            } else if (prec.contains("CA_CERTIFICATE") || prec.contains("INVOICE")) {
                cr.setStatus("COMPLIANT");
            }
            cr.setReviewStatus("OVERRIDDEN");
            cr.setReasoning(String.format(
                "[CONTRADICTION RESOLVED] Authoritative document: %s. Reviewer justification: %s. Anchored on EVM (Tx: %s, Block: #%d)",
                resolution.getPrecedentDocument(), resolution.getRationale(), receipt.txHash(), receipt.blockNumber()
            ));
            cr.setUpdatedAt(ZonedDateTime.now());
            complianceResultRepository.save(cr);
        });

        return ResponseEntity.ok(Map.of(
            "id", resolutionId,
            "status", "RESOLVED",
            "bidId", request.getBidId(),
            "requirementId", request.getRequirementId(),
            "precedentDocument", resolution.getPrecedentDocument(),
            "rationale", resolution.getRationale(),
            "resolvedBy", actorId,
            "onChainAnchored", true,
            "txHash", receipt.txHash(),
            "blockNumber", receipt.blockNumber()
        ));
    }

    @GetMapping("/reviews/calibration/me")
    @PreAuthorize("hasAnyAuthority('COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Personal Reviewer Calibration", description = "Returns personal override rate and confidence calibration data for current reviewer.")
    public ResponseEntity<List<Map<String, Object>>> getMyCalibration() {
        String currentUserId = userService.getCurrentUser().map(u -> u.getId()).orElse("USR-DEMO-REV");
        String reviewerName = userService.getCurrentUser().map(u -> u.getFullName()).orElse("Compliance Reviewer");

        List<Review> myReviews = reviewRepository.findByReviewerId(currentUserId);
        Map<String, ComplianceResult> resultMap = complianceResultRepository.findAll().stream()
            .collect(Collectors.toMap(ComplianceResult::getId, r -> r, (a, b) -> a));

        List<Map<String, Object>> points = new ArrayList<>();
        for (Review r : myReviews) {
            ComplianceResult cr = resultMap.get(r.getComplianceResultId());
            double confidence = cr != null && cr.getConfidence() != null ? cr.getConfidence().doubleValue() * 100.0 : 85.0;
            boolean isOverride = r.getOriginalStatus() != null && !r.getOriginalStatus().equalsIgnoreCase(r.getFinalStatus());

            points.add(Map.of(
                "reviewer", reviewerName,
                "ai_confidence", Math.round(confidence),
                "overridden", isOverride ? 1 : 0,
                "original_status", r.getOriginalStatus() != null ? r.getOriginalStatus() : "UNKNOWN",
                "final_status", r.getFinalStatus() != null ? r.getFinalStatus() : "UNKNOWN"
            ));
        }

        return ResponseEntity.ok(points);
    }
}
