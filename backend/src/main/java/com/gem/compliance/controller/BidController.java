package com.gem.compliance.controller;

import com.gem.compliance.domain.Bid;
import com.gem.compliance.domain.Tender;
import com.gem.compliance.exception.ResourceNotFoundException;
import com.gem.compliance.exception.ValidationException;
import com.gem.compliance.repository.BidRepository;
import com.gem.compliance.repository.TenderRepository;
import com.gem.compliance.service.BlockchainService;
import com.gem.compliance.service.DebarmentService;
import com.gem.compliance.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
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
    private final TenderRepository tenderRepository;
    private final DebarmentService debarmentService;
    private final BlockchainService blockchainService;
    private final UserService userService;

    /**
     * Create a new bid for a tender.
     * Enforces transactional integrity: tender existence check, duplicate bid prevention,
     * prior debarment verification, and asynchronous tamper-proof blockchain anchoring.
     */
    @PostMapping("/upload")
    @Transactional
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN', 'BIDDER_VENDOR', 'BIDDER', 'ROLE_SYSTEM_ADMIN', 'ROLE_BIDDER_VENDOR', 'ROLE_BIDDER')")
    public ResponseEntity<Map<String, Object>> createBid(@RequestBody Map<String, String> payload) {
        String tenderId = payload.get("tenderId");
        if (tenderId == null || tenderId.isBlank()) {
            throw new ValidationException("Tender ID is required to submit a bid.");
        }

        // 1. Validate tender exists and bidding is open
        Tender tender = tenderRepository.findById(tenderId)
            .orElseThrow(() -> new ResourceNotFoundException("Tender not found with ID: " + tenderId));

        if ("AWARDED".equalsIgnoreCase(tender.getStatus()) 
            || "COMPLETED".equalsIgnoreCase(tender.getStatus()) 
            || "ARCHIVED".equalsIgnoreCase(tender.getStatus())) {
            throw new ValidationException("Bidding is closed for tender " + tender.getTenderNumber() + " (Status: " + tender.getStatus() + ").");
        }

        var currentUser = userService.getCurrentUser();
        String bidderName = payload.get("bidderName");
        if (bidderName == null || bidderName.isBlank()) {
            bidderName = currentUser.map(com.gem.compliance.domain.User::getFullName).orElse("Registered Bidder");
        }

        String email = payload.getOrDefault("email", "");
        if (email.isBlank() && currentUser.isPresent()) {
            email = currentUser.get().getEmail();
        }
        if (email.isBlank()) {
            throw new ValidationException("Bidder email is required to associate and isolate bid records.");
        }

        // 2. Prevent duplicate bids from the same bidder on the same tender
        final String finalEmail = email;
        boolean hasDuplicate = bidRepository.findByTenderId(tenderId).stream()
            .anyMatch(b -> b.getBidderEmail() != null && b.getBidderEmail().equalsIgnoreCase(finalEmail));
        if (hasDuplicate) {
            throw new ValidationException("Duplicate bid detected: A bid from " + email + " for tender " + tenderId + " has already been submitted.");
        }

        String gstin = payload.get("gstin");
        String pan = payload.get("pan");

        // 3. Run debarment check BEFORE bid creation
        DebarmentService.DebarmentResult debarment = debarmentService.check(bidderName, gstin, pan, null);
        log.info("Debarment check evaluated for bidder '{}': status={}", bidderName, debarment.status());

        String id = payload.get("id");
        if (id == null || id.isBlank()) {
            id = "BID-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        Bid bid = Bid.builder()
            .id(id)
            .tenderId(tender.getId())
            .bidderName(bidderName)
            .bidderGstin(gstin)
            .bidderPan(pan)
            .bidderEmail(email)
            .bidderPhone(payload.getOrDefault("phone", ""))
            .bidderAddress(payload.getOrDefault("address", ""))
            .status(debarment.status() == DebarmentService.DebarmentStatus.FLAGGED ? "UNDER_REVIEW" : "SUBMITTED")
            .debarmentStatus(debarment.status().name())
            .riskScore(BigDecimal.valueOf(debarment.status() == DebarmentService.DebarmentStatus.FLAGGED ? 85.0 : 10.0))
            .riskFactors(debarment.message())
            .build();

        bidRepository.save(bid);

        // 4. Anchor bid creation on blockchain synchronously (graceful fallback if node is offline)
        String txHash = null;
        try {
            var receipt = blockchainService.anchorAuditEventSync(bid.getId(), "BID_SUBMITTED", bidderName);
            txHash = receipt.txHash();
        } catch (Exception ex) {
            log.warn("Blockchain anchoring failed: {}", ex.getMessage());
        }

        log.info("Bid created successfully: {} for tender {} — debarment: {}", bid.getId(), tenderId, debarment.status());
        Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("id", bid.getId());
        resp.put("tenderId", bid.getTenderId());
        resp.put("bidderName", bid.getBidderName());
        resp.put("bidderEmail", bid.getBidderEmail());
        resp.put("status", bid.getStatus());
        resp.put("debarmentStatus", bid.getDebarmentStatus());
        resp.put("riskScore", bid.getRiskScore());
        resp.put("blockchainTx", txHash);
        return ResponseEntity.ok(resp);
    }

    /**
     * Get current bidder's own submitted bids.
     * Strictly isolated by exact authenticated email.
     */
    @GetMapping("/my-bids")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Bid>> getMyBids() {
        var currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        String email = currentUser.get().getEmail();
        if (email == null || email.isBlank()) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(
            bidRepository.findAll().stream()
                .filter(b -> b.getBidderEmail() != null && b.getBidderEmail().equalsIgnoreCase(email))
                .toList()
        );
    }

    /**
     * Get all bids for a tender (multi-bidder comparison).
     * Accessible by Committee roles; Bidder is strictly scoped to own bid by exact email match only.
     */
    @GetMapping("/tender/{tenderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Bid>> getBidsForTender(@PathVariable String tenderId) {
        List<Bid> bids = bidRepository.findActiveBidsForTender(tenderId);
        
        // If current user is a Bidder, filter out competitor bids to preserve data isolation
        var currentUser = userService.getCurrentUser();
        if (currentUser.isPresent()) {
            String role = currentUser.get().getRole() != null ? currentUser.get().getRole().toUpperCase().replace("ROLE_", "") : "";
            if (role.contains("BIDDER")) {
                String email = currentUser.get().getEmail();
                bids = bids.stream()
                    .filter(b -> b.getBidderEmail() != null && b.getBidderEmail().equalsIgnoreCase(email))
                    .toList();
            }
        }
        return ResponseEntity.ok(bids);
    }

    /**
     * Get a specific bid by ID.
     * Enforces strict data isolation for Bidder role: competitor bids return 403 Forbidden.
     */
    @GetMapping("/{bidId}")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'COMPLIANCE_REVIEWER', 'AUDITOR', 'BIDDER_VENDOR', 'BIDDER', 'VIEWER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_AUDITOR', 'ROLE_BIDDER_VENDOR', 'ROLE_BIDDER', 'ROLE_VIEWER')")
    public ResponseEntity<Bid> getBid(@PathVariable String bidId) {
        Bid bid = bidRepository.findById(bidId)
            .orElseThrow(() -> new ResourceNotFoundException("Bid not found with ID: " + bidId));

        // Enforce data isolation for BIDDER
        userService.getCurrentUser().ifPresent(user -> {
            String role = user.getRole() != null ? user.getRole().toUpperCase().replace("ROLE_", "") : "";
            if (role.contains("BIDDER")) {
                boolean isOwnBid = bid.getBidderEmail() != null && bid.getBidderEmail().equalsIgnoreCase(user.getEmail());
                if (!isOwnBid) {
                    throw new AccessDeniedException(
                        "403 Forbidden: Bidders are strictly prohibited from inspecting competitor bids or commercial dossiers."
                    );
                }
            }
        });

        return ResponseEntity.ok(bid);
    }

    /**
     * Run debarment check on a specific bidder.
     */
    @PostMapping("/{bidId}/debarment-check")
    @PreAuthorize("isAuthenticated()")
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
            try {
                blockchainService.anchorAuditEvent(bidId, "DEBARMENT_CHECK", "SYSTEM");
            } catch (Exception ex) {
                log.warn("Debarment check blockchain audit warning: {}", ex.getMessage());
            }
            return ResponseEntity.ok(result);
        }).orElseThrow(() -> new ResourceNotFoundException("Bid not found with ID: " + bidId));
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
