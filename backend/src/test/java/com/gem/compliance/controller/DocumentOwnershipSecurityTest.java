package com.gem.compliance.controller;

import com.gem.compliance.domain.Bid;
import com.gem.compliance.domain.User;
import com.gem.compliance.dto.DocumentUploadResponse;
import com.gem.compliance.repository.BidRepository;
import com.gem.compliance.repository.TenderRepository;
import com.gem.compliance.service.DocumentProcessingService;
import com.gem.compliance.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import java.time.ZonedDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DocumentOwnershipSecurityTest {

    @Mock
    private DocumentProcessingService documentProcessingService;

    @Mock
    private BidRepository bidRepository;

    @Mock
    private TenderRepository tenderRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private DocumentController documentController;

    private User bidderUser;
    private MockMultipartFile samplePdf;

    @BeforeEach
    void setUp() {
        bidderUser = User.builder()
                .id("USR-BID-001")
                .email("vendor.alpha@acme.com")
                .fullName("Acme Solutions Bidder")
                .role("BIDDER_VENDOR")
                .build();

        samplePdf = new MockMultipartFile(
                "file",
                "technical_specs.pdf",
                "application/pdf",
                "Mock PDF content".getBytes()
        );
    }

    @Test
    @DisplayName("Fix 10: Bidder is forbidden from uploading tender-level specifications directly")
    void testBidderCannotUploadTenderSpecification() {
        when(userService.getCurrentUser()).thenReturn(Optional.of(bidderUser));

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            documentController.uploadDocument(samplePdf, null, "TND-PUMP-001");
        });

        assertTrue(ex.getMessage().contains("Bidders cannot upload tender-level specifications"),
                "Must reject tender-level upload from bidder accounts");
    }

    @Test
    @DisplayName("Fix 10 & IDOR: Bidder is forbidden from uploading documents to another bidder's bid")
    void testBidderCannotUploadToCompetitorBid() {
        when(userService.getCurrentUser()).thenReturn(Optional.of(bidderUser));

        Bid competitorBid = Bid.builder()
                .id("BID-COMPETITOR-999")
                .tenderId("TND-PUMP-001")
                .bidderEmail("competitor@rival.com") // Owned by another account
                .build();

        when(bidRepository.findById("BID-COMPETITOR-999")).thenReturn(Optional.of(competitorBid));

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            documentController.uploadDocument(samplePdf, "BID-COMPETITOR-999", "TND-PUMP-001");
        });

        assertTrue(ex.getMessage().contains("Mismatched ownership"),
                "Must prevent IDOR tampering across different bidder accounts");
    }

    @Test
    @DisplayName("Legitimate bidder can upload document to their own registered bid")
    void testBidderCanUploadToOwnBid() {
        when(userService.getCurrentUser()).thenReturn(Optional.of(bidderUser));

        Bid ownBid = Bid.builder()
                .id("BID-OWN-123")
                .tenderId("TND-PUMP-001")
                .bidderEmail("vendor.alpha@acme.com") // Matches authenticated user
                .build();

        when(bidRepository.findById("BID-OWN-123")).thenReturn(Optional.of(ownBid));

        DocumentUploadResponse mockResponse = DocumentUploadResponse.builder()
                .documentId("DOC-001")
                .filename("technical_specs.pdf")
                .status("COMPLETED")
                .build();

        when(documentProcessingService.processDocumentUpload(anyString(), anyString(), any(), anyString(), anyString())).thenReturn(mockResponse);

        ResponseEntity<DocumentUploadResponse> response =
                documentController.uploadDocument(samplePdf, "BID-OWN-123", "TND-PUMP-001");

        assertNotNull(response);
        assertEquals(202, response.getStatusCode().value(), "Document upload endpoint returns 202 Accepted for async processing");
        assertNotNull(response.getBody());
        assertEquals("DOC-001", response.getBody().getDocumentId());
    }
}
