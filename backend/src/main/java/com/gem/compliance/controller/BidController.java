package com.gem.compliance.controller;

import com.gem.compliance.domain.Bid;
import com.gem.compliance.repository.BidRepository;
import com.gem.compliance.service.DebarmentService;
import com.gem.compliance.service.BlockchainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bids")
@RequiredArgsConstructor
@Slf4j
public class BidController {

    private final BidRepository bidRepository;
    private final DebarmentService debarmentService;
    private final BlockchainService blockchainService;

    /**
     * Create a new bid for a tender.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'BIDDER_VENDOR', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN', 'ROLE_BIDDER_VENDOR')")
    public ResponseEntity<Bid> createBid(@RequestBody Map<String, String> payload) {
        String tenderId = payload.get("tenderId");
        String bidderName = payload.get("bidderName");
        String gstin = payload.get("gstin");
        String pan = payload.get("pan");

        // Run debarment check first
        DebarmentService.DebarmentResult debarment = debarmentService.check(bidderName, gstin, pan, null);

        Bid bid = Bid.builder()
            .id(UUID.randomUUID().toString())
            .tenderId(tenderId)
            .bidderName(bidderName)
            .bidderGstin(gstin)
            .bidderPan(pan)
            .bidderEmail(payload.getOrDefault("email", ""))
            .bidderPhone(payload.getOrDefault("phone", ""))
            .bidderAddress(payload.getOrDefault("address", ""))
            .status("SUBMITTED")
            .debarmentStatus(debarment.status().name())
            .riskScore(BigDecimal.valueOf(debarment.status() == DebarmentService.DebarmentStatus.FLAGGED ? 85.0 : 10.0))
            .riskFactors(debarment.message())
            .build();

        bidRepository.save(bid);

        // Anchor bid creation on blockchain (async, non-blocking)
        blockchainService.anchorAuditEvent(bid.getId(), "BID_SUBMITTED", bidderName);

        log.info("Bid created: {} for tender {} — debarment: {}", bid.getId(), tenderId, debarment.status());
        return ResponseEntity.ok(bid);
    }

    /**
     * Get all bids for a tender (multi-bidder comparison).
     */
    @GetMapping("/tender/{tenderId}")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'COMPLIANCE_REVIEWER', 'AUDITOR', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_AUDITOR', 'ROLE_VIEWER')")
    public ResponseEntity<List<Bid>> getBidsForTender(@PathVariable String tenderId) {
        return ResponseEntity.ok(bidRepository.findActiveBidsForTender(tenderId));
    }

    /**
     * Get a specific bid by ID.
     */
    @GetMapping("/{bidId}")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'COMPLIANCE_REVIEWER', 'AUDITOR', 'BIDDER_VENDOR', 'BIDDER', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_AUDITOR', 'ROLE_BIDDER_VENDOR', 'ROLE_BIDDER', 'ROLE_VIEWER')")
    public ResponseEntity<Bid> getBid(@PathVariable String bidId) {
        return bidRepository.findById(bidId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Run debarment check on a specific bidder.
     */
    @PostMapping("/{bidId}/debarment-check")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN')")
    public ResponseEntity<DebarmentService.DebarmentResult> runDebarmentCheck(
        @PathVariable String bidId,
        @RequestBody(required = false) Map<String, Object> extra
    ) {
        return bidRepository.findById(bidId).map(bid -> {
            DebarmentService.DebarmentResult result = debarmentService.check(
                bid.getBidderName(), bid.getBidderGstin(), bid.getBidderPan(), null
            );
            bid.setDebarmentStatus(result.status().name());
            bidRepository.save(bid);
            blockchainService.anchorAuditEvent(bidId, "DEBARMENT_CHECK", "SYSTEM");
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get blockchain proof for a bid event.
     */
    @GetMapping("/{bidId}/blockchain-proof")
    public ResponseEntity<BlockchainService.BlockchainProof> getBlockchainProof(
        @PathVariable String bidId,
        @RequestParam String txHash
    ) {
        return ResponseEntity.ok(blockchainService.verifyEvent(txHash));
    }
}
