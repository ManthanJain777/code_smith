package com.gem.compliance.service;

import com.gem.compliance.domain.Bid;
import com.gem.compliance.domain.ComplianceResult;
import com.gem.compliance.domain.Requirement;
import com.gem.compliance.domain.User;
import com.gem.compliance.dto.ComplianceResultDTO;
import com.gem.compliance.dto.HumanReviewRequest;
import com.gem.compliance.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ComplianceServiceMathematicalTest {

    @Mock
    private ComplianceResultRepository complianceResultRepository;

    @Mock
    private RequirementRepository requirementRepository;

    @Mock
    private BidRepository bidRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private BlockchainService blockchainService;

    @Mock
    private UserService userService;

    @InjectMocks
    private ComplianceService complianceService;

    private Requirement turnoverReq;
    private Requirement qualitativeReq;
    private User authenticatedReviewer;

    @BeforeEach
    void setUp() {
        com.gem.compliance.domain.Tender tender = com.gem.compliance.domain.Tender.builder()
                .id("TND-PUMP-001")
                .build();

        turnoverReq = Requirement.builder()
                .id("REQ-FIN-001")
                .tender(tender)
                .category("Financial")
                .reqType("NUMERIC_THRESHOLD")
                .threshold(new BigDecimal("100.00"))
                .operator(">=")
                .unit("Cr")
                .rawText("Bidder must have average annual financial turnover of at least INR 100 Crores")
                .isMandatory(true)
                .build();

        qualitativeReq = Requirement.builder()
                .id("REQ-QUAL-001")
                .tender(tender)
                .category("Technical")
                .reqType("TEXT_SEMANTIC")
                .rawText("Bidder must demonstrate prior service maintenance network within state jurisdiction")
                .isMandatory(true)
                .build();

        authenticatedReviewer = User.builder()
                .id("USR-REV-001")
                .email("reviewer.demo@gembid.local")
                .fullName("Sh. Ramesh Verma")
                .role("COMPLIANCE_REVIEWER")
                .organizationId("ORG-001")
                .build();
    }

    @Test
    @DisplayName("Fix 01: Turnover evaluation is purely mathematical, not forced by prior riskScore >= 60")
    void testMathematicalTurnoverEvaluation_CompliantEvenWithHighPriorRisk() {
        // Bidder Bharat has extracted turnover of 210 Cr (exceeds 100 Cr threshold),
        // but has an existing riskScore of 75.0 (which previously caused false NON_COMPLIANT)
        Bid compliantBid = Bid.builder()
                .id("BID-BHARAT-001")
                .tenderId("TND-PUMP-001")
                .bidderName("Bharat Fluidics Ltd")
                .riskScore(new BigDecimal("75.00")) // Prior risk score >= 60
                .debarmentStatus("CLEAR")
                .build();

        when(requirementRepository.findByTenderId("TND-PUMP-001")).thenReturn(List.of(turnoverReq));
        when(bidRepository.findById("BID-BHARAT-001")).thenReturn(Optional.of(compliantBid));
        when(complianceResultRepository.findByBidId("BID-BHARAT-001")).thenReturn(Collections.emptyList());

        List<ComplianceResultDTO> results = complianceService.evaluateTenderBids("TND-PUMP-001", "BID-BHARAT-001");

        assertEquals(1, results.size());
        ComplianceResultDTO res = results.get(0);

        // Verification: Deterministic math must evaluate to COMPLIANT despite prior riskScore >= 60
        assertEquals("COMPLIANT", res.getStatus(), "Mathematical evaluation (210 >= 100) must yield COMPLIANT");
        assertTrue(res.getReasoning().contains("Operands: extracted=210.00, threshold=100.00, operator=>="),
                "Reasoning must record exact operands and mathematical operator");
        assertTrue(res.getReasoning().contains("Bharat_Valves_CA_Certificate.pdf"),
                "Reasoning must cite specific source evidence");
    }

    @Test
    @DisplayName("Fix 01: Turnover evaluation fails mathematically when extracted value is below threshold")
    void testMathematicalTurnoverEvaluation_NonCompliantWhenBelowThreshold() {
        // Bidder Apex has extracted turnover of 94 Cr, failing the 100 Cr threshold
        Bid failingBid = Bid.builder()
                .id("BID-APEX-001")
                .tenderId("TND-PUMP-001")
                .bidderName("Apex Pumps & Systems")
                .riskScore(new BigDecimal("20.00")) // Even with low initial risk
                .debarmentStatus("CLEAR")
                .build();

        when(requirementRepository.findByTenderId("TND-PUMP-001")).thenReturn(List.of(turnoverReq));
        when(bidRepository.findById("BID-APEX-001")).thenReturn(Optional.of(failingBid));
        when(complianceResultRepository.findByBidId("BID-APEX-001")).thenReturn(Collections.emptyList());

        List<ComplianceResultDTO> results = complianceService.evaluateTenderBids("TND-PUMP-001", "BID-APEX-001");

        assertEquals(1, results.size());
        ComplianceResultDTO res = results.get(0);

        assertEquals("NON_COMPLIANT", res.getStatus());
        assertTrue(res.getReasoning().contains("fails configured tender threshold"));
        assertTrue(res.getReasoning().contains("Operands: extracted=94.00, threshold=100.00, operator=>="));
    }

    @Test
    @DisplayName("Fix 02: Qualitative requirement defaults to UNVERIFIED under GFR Rule 173")
    void testQualitativeRequirementDefaultsToUnverified() {
        Bid bid = Bid.builder()
                .id("BID-APEX-001")
                .tenderId("TND-PUMP-001")
                .bidderName("Apex Pumps & Systems")
                .debarmentStatus("CLEAR")
                .build();

        when(requirementRepository.findByTenderId("TND-PUMP-001")).thenReturn(List.of(qualitativeReq));
        when(bidRepository.findById("BID-APEX-001")).thenReturn(Optional.of(bid));
        when(complianceResultRepository.findByBidId("BID-APEX-001")).thenReturn(Collections.emptyList());

        List<ComplianceResultDTO> results = complianceService.evaluateTenderBids("TND-PUMP-001", "BID-APEX-001");

        assertEquals(1, results.size());
        ComplianceResultDTO res = results.get(0);

        // Verification: Qualitative requirements without explicit classifier MUST NOT default to COMPLIANT
        assertEquals("UNVERIFIED", res.getStatus(), "Qualitative requirements must default to UNVERIFIED");
        assertTrue(res.getReasoning().contains("GFR Rule 173"), "Must reference human review under GFR 173");
    }

    @Test
    @DisplayName("Fix 08 & F-13: Human review override derives reviewer actor strictly from authenticated session")
    void testHumanReviewOverrideDerivesReviewerFromSession() {
        ComplianceResult existingCr = ComplianceResult.builder()
                .id("CR-001")
                .bidId("BID-001")
                .requirementId("REQ-001")
                .status("UNVERIFIED")
                .build();

        when(complianceResultRepository.findById("CR-001")).thenReturn(Optional.of(existingCr));
        when(userService.getCurrentUser()).thenReturn(Optional.of(authenticatedReviewer));
        when(blockchainService.anchorAuditEventSync(anyString(), anyString(), anyString()))
                .thenReturn(new BlockchainService.AnchorReceipt("0xabc123", 1050L, "ON_CHAIN_CONFIRMED"));

        // Malicious client sends a forged reviewerId
        HumanReviewRequest clientRequest = HumanReviewRequest.builder()
                .complianceResultId("CR-001")
                .reviewerId("FORGED_IMPERSONATED_ACTOR_999")
                .finalStatus("COMPLIANT")
                .reviewerNote("Service network verified during physical site audit.")
                .build();

        complianceService.processHumanReview(clientRequest);

        // Capture saved review to verify authoritative actor
        ArgumentCaptor<com.gem.compliance.domain.Review> reviewCaptor =
                ArgumentCaptor.forClass(com.gem.compliance.domain.Review.class);
        verify(reviewRepository).save(reviewCaptor.capture());

        com.gem.compliance.domain.Review savedReview = reviewCaptor.getValue();
        // Verification: The saved reviewer MUST be the session user, NEVER the forged ID
        assertEquals("USR-REV-001", savedReview.getReviewerId(), "Actor ID must match authenticated session principal");
        assertNotEquals("FORGED_IMPERSONATED_ACTOR_999", savedReview.getReviewerId());
    }
}
