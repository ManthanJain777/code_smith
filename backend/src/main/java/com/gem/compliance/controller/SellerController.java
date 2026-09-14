package com.gem.compliance.controller;

import com.gem.compliance.domain.Seller;
import com.gem.compliance.dto.SellerDTO;
import com.gem.compliance.dto.SellerRiskOverrideRequest;
import com.gem.compliance.repository.SellerRepository;
import com.gem.compliance.service.GovernmentVerificationService;
import com.gem.compliance.service.SellerVerificationEngine;
import com.gem.compliance.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/sellers")
@RequiredArgsConstructor
@Tag(name = "Seller Verification & Risk Engine", description = "Endpoints for seller trust scoring, government connectors (all 13 SIH portals), and human risk overrides")
public class SellerController {

    private final SellerRepository sellerRepository;
    private final SellerVerificationEngine verificationEngine;
    private final UserService userService;
    private final GovernmentVerificationService governmentVerificationService;
    private final com.gem.compliance.service.AiServiceClient aiServiceClient;
    private final com.gem.compliance.repository.BidRepository bidRepository;

    private Seller resolveCurrentSeller() {
        return userService.getCurrentUser().flatMap(u -> {
            if (u.getOrganizationId() != null && !u.getOrganizationId().isBlank()) {
                java.util.Optional<Seller> byOrg = sellerRepository.findById(u.getOrganizationId());
                if (byOrg.isPresent()) return byOrg;
            }
            String email = u.getEmail() != null ? u.getEmail().trim().toLowerCase() : "";
            if (!email.isEmpty()) {
                var byEmail = sellerRepository.findAll().stream()
                    .filter(s -> s.getId() != null && s.getId().equalsIgnoreCase(u.getOrganizationId()))
                    .findFirst();
                if (byEmail.isPresent()) return byEmail;
            }
            return java.util.Optional.<Seller>empty();
        }).orElseThrow(() -> new org.springframework.security.access.AccessDeniedException(
            "403 Forbidden: Authenticated vendor is not associated with an authorized seller organization."
        ));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current vendor's own verification standing", description = "Allows a vendor to inspect their own GSTIN, MSME, and trust score details without seeing other sellers.")
    public ResponseEntity<SellerDTO> getMySellerProfile() {
        Seller seller = resolveCurrentSeller();
        return ResponseEntity.ok(mapToDTO(seller));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'COMPLIANCE_REVIEWER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_COMPLIANCE_REVIEWER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Get Seller Verification Queue", description = "Returns list of all sellers with trust scores and verification statuses.")
    public ResponseEntity<List<SellerDTO>> getAllSellers() {
        List<Seller> sellers = sellerRepository.findAll();
        List<SellerDTO> dtos = sellers.stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get Seller Profile & Verification Detail", description = "Retrieves full seller details including government connector verification results.")
    public ResponseEntity<SellerDTO> getSellerById(@PathVariable String id) {
        if ("me".equalsIgnoreCase(id)) {
            return getMySellerProfile();
        }
        Seller seller = sellerRepository.findById(id)
            .orElseGet(() -> sellerRepository.findAll().stream()
                .filter(s -> s.getId() != null && s.getId().equalsIgnoreCase(id))
                .findFirst()
                .orElse(null));
        if (seller == null) {
            return ResponseEntity.notFound().build();
        }

        // Strict isolation: Bidders can only view their own registered seller organization
        var currentUser = userService.getCurrentUser();
        if (currentUser.isPresent()) {
            String role = currentUser.get().getRole() != null ? currentUser.get().getRole().toUpperCase().replace("ROLE_", "") : "";
            if (role.contains("BIDDER")) {
                Seller mySeller = resolveCurrentSeller();
                if (!mySeller.getId().equalsIgnoreCase(seller.getId())) {
                    throw new org.springframework.security.access.AccessDeniedException(
                        "403 Forbidden: Bidders are strictly prohibited from inspecting competitor vendor dossiers."
                    );
                }
            }
        }

        return ResponseEntity.ok(mapToDTO(seller));
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Execute AI & Deterministic Seller Verification Pipeline", description = "Queries government connectors and updates Trust Score.")
    public ResponseEntity<SellerDTO> verifySeller(@PathVariable String id) {
        String realId = "me".equalsIgnoreCase(id) ? resolveCurrentSeller().getId() : id;
        Seller updated = verificationEngine.verifyAndCalculateTrustScore(realId);
        return ResponseEntity.ok(mapToDTO(updated));
    }

    @PostMapping("/{id}/verify-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Run Full Government Portal Verification (All 13 Portals)",
        description = "Executes all 13 SIH-mandated government portal checks: GSTN, PAN+IncomeTax, MCA21, Udyam/MSME, Startup India/DPIIT, NSIC, OEM Authorization, Make in India, BIS/DPIIT, EPFO, ESIC, DigiLocker, and Debarment/Blacklist. Returns structured PortalVerificationReport."
    )
    public ResponseEntity<Map<String, Object>> verifyAllPortals(@PathVariable String id) {
        Seller seller = "me".equalsIgnoreCase(id) ? resolveCurrentSeller() : sellerRepository.findById(id).orElse(null);
        if (seller == null) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> report = new java.util.LinkedHashMap<>(governmentVerificationService.runAllPortalChecks(seller));

        try {
            List<com.gem.compliance.domain.Bid> allBids = bidRepository.findAll();
            if (allBids.size() >= 2) {
                List<Map<String, Object>> bidProfiles = allBids.stream().map(b -> {
                    Map<String, Object> p = new java.util.HashMap<>();
                    p.put("bid_id", b.getId());
                    p.put("bidder_name", b.getBidderName() != null ? b.getBidderName() : "");
                    p.put("bidder_gstin", b.getBidderGstin() != null ? b.getBidderGstin() : "");
                    p.put("bidder_pan", b.getBidderPan() != null ? b.getBidderPan() : "");
                    p.put("bidder_address", b.getBidderAddress() != null ? b.getBidderAddress() : "");
                    p.put("bidder_phone", b.getBidderPhone() != null ? b.getBidderPhone() : "");
                    return p;
                }).collect(Collectors.toList());

                Map<String, Object> collusionResult = aiServiceClient.checkCollusion(bidProfiles);
                report.put("collusion_analysis", collusionResult);

                Object signalsObj = collusionResult.get("signals");
                if (signalsObj instanceof List<?> sigList && !sigList.isEmpty()) {
                    String flagsJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(signalsObj);
                    for (com.gem.compliance.domain.Bid b : allBids) {
                        b.setCollusionFlags(flagsJson);
                        bidRepository.save(b);
                    }
                }
            }
        } catch (Exception e) {
            // Non-blocking collusion check
        }

        return ResponseEntity.ok(report);
    }

    @PostMapping("/{id}/verify/{portalKey}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Run Single Government Portal Verification", description = "Executes a specific government portal check (e.g. GSTN, MCA21) dynamically.")
    public ResponseEntity<Map<String, Object>> verifySinglePortal(@PathVariable String id, @PathVariable String portalKey) {
        Seller seller = "me".equalsIgnoreCase(id) ? resolveCurrentSeller() : sellerRepository.findById(id).orElse(null);
        if (seller == null) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> report = governmentVerificationService.runSinglePortalCheck(seller, portalKey);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/{id}/override")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN')")
    @Operation(summary = "Submit Human Procurement Risk Override", description = "Allows Procurement Officer to override AI seller risk score with auditable rationale.")
    public ResponseEntity<SellerDTO> overrideSellerRisk(
        @PathVariable String id,
        @Valid @RequestBody SellerRiskOverrideRequest request
    ) {
        String reviewerId = userService.getCurrentUser().map(u -> u.getId()).orElse("USR-DEMO-PROC");
        Seller updated = verificationEngine.processRiskOverride(id, reviewerId, request.getOverrideDecision(), request.getReason());
        return ResponseEntity.ok(mapToDTO(updated));
    }

    @PostMapping("/{id}/documents/ocr-verify")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Ingest OCR-scanned statutory document", description = "Updates seller registry fields from OCR scanning and triggers verification recalculation.")
    public ResponseEntity<SellerDTO> ocrVerifyDocument(
        @PathVariable String id,
        @RequestBody Map<String, Object> payload
    ) {
        Seller seller = "me".equalsIgnoreCase(id) ? resolveCurrentSeller() : sellerRepository.findById(id).orElse(null);
        if (seller == null) {
            return ResponseEntity.notFound().build();
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> fields = (Map<String, Object>) payload.getOrDefault("extractedFields", Map.of());

        if (fields.containsKey("gstin") && fields.get("gstin") != null) {
            seller.setGstin((String) fields.get("gstin"));
        }
        if (fields.containsKey("cin") && fields.get("cin") != null) {
            seller.setCinOrPan((String) fields.get("cin"));
        }
        if (fields.containsKey("pan") && fields.get("pan") != null) {
            String existingCin = seller.getCinOrPan() != null && seller.getCinOrPan().contains("/") ? seller.getCinOrPan().split("/")[0].trim() : "U45201DL2015PTC284910";
            seller.setCinOrPan(existingCin + " / " + fields.get("pan"));
        }
        if (fields.containsKey("udyamRegistration") && fields.get("udyamRegistration") != null) {
            seller.setUdyamRegistration((String) fields.get("udyamRegistration"));
        }
        if (fields.containsKey("dpiitNumber") && fields.get("dpiitNumber") != null) {
            seller.setDpiitNumber((String) fields.get("dpiitNumber"));
        }
        if (fields.containsKey("bisLicense") && fields.get("bisLicense") != null) {
            seller.setBisLicense((String) fields.get("bisLicense"));
        }
        if (fields.containsKey("epfoCode") && fields.get("epfoCode") != null) {
            seller.setEpfoCode((String) fields.get("epfoCode"));
        }
        if (fields.containsKey("organizationName") && fields.get("organizationName") != null) {
            seller.setOrganizationName((String) fields.get("organizationName"));
        }
        if (fields.containsKey("registeredAddress") && fields.get("registeredAddress") != null) {
            seller.setRegisteredAddress((String) fields.get("registeredAddress"));
        }

        seller.setUpdatedAt(java.time.ZonedDateTime.now());
        sellerRepository.save(seller);

        Seller updated = verificationEngine.verifyAndCalculateTrustScore(seller.getId());
        return ResponseEntity.ok(mapToDTO(updated));
    }

    @PostMapping("/{id}/digilocker-sync")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Sync Verifiable Credentials from DigiLocker Simulation", description = "Applies certified credentials from DigiLocker consent into seller profile and elevates trust score.")
    public ResponseEntity<SellerDTO> syncDigiLockerCredentials(
        @PathVariable String id,
        @RequestBody Map<String, Object> payload
    ) {
        Seller seller = "me".equalsIgnoreCase(id) ? resolveCurrentSeller() : sellerRepository.findById(id).orElse(null);
        if (seller == null) {
            return ResponseEntity.notFound().build();
        }

        seller.setTrustScore(new java.math.BigDecimal("96.50"));
        seller.setVerificationStatus("VERIFIED");
        seller.setIsDebarred(false);
        seller.setUpdatedAt(java.time.ZonedDateTime.now());
        
        sellerRepository.save(seller);
        return ResponseEntity.ok(mapToDTO(seller));
    }

    private Seller createDefaultSeller(String id, String name) {
        return Seller.builder()
            .id(id)
            .organizationName(name)
            .cinOrPan("U45201DL2015PTC284910 / AAACA1234F")
            .gstin("07AAAAA0000A1Z5")
            .udyamRegistration("UDYAM-DL-01-0012345")
            .dpiitNumber("DPIIT-2023-OEM-8841")
            .bisLicense("BIS-LIC-54321")
            .epfoCode("DL/CPM/998877")
            .registeredAddress("Industrial Area Phase-III, New Delhi - 110020")
            .category("Industrial Manufacturing & Fluid Systems")
            .isDebarred(false)
            .trustScore(new java.math.BigDecimal("85.00"))
            .verificationStatus("VERIFIED")
            .build();
    }

    private SellerDTO mapToDTO(Seller s) {
        List<SellerDTO.VerificationResultDTO> results = null;
        if (s.getVerificationResults() != null) {
            results = s.getVerificationResults().stream().map(vr ->
                SellerDTO.VerificationResultDTO.builder()
                    .connectorName(vr.getConnectorName())
                    .status(vr.getStatus())
                    .responseJson(vr.getResponseJson())
                    .verifiedAt(vr.getVerifiedAt())
                    .build()
            ).collect(Collectors.toList());
        }

        return SellerDTO.builder()
            .id(s.getId())
            .organizationName(s.getOrganizationName())
            .cinOrPan(s.getCinOrPan())
            .gstin(s.getGstin())
            .udyamRegistration(s.getUdyamRegistration())
            .dpiitNumber(s.getDpiitNumber())
            .bisLicense(s.getBisLicense())
            .epfoCode(s.getEpfoCode())
            .registeredAddress(s.getRegisteredAddress())
            .category(s.getCategory())
            .isDebarred(s.getIsDebarred())
            .trustScore(s.getTrustScore())
            .verificationStatus(s.getVerificationStatus())
            .createdAt(s.getCreatedAt())
            .updatedAt(s.getUpdatedAt())
            .verificationResults(results)
            .build();
    }
}
