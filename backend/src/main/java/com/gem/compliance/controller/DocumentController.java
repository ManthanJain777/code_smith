package com.gem.compliance.controller;

import com.gem.compliance.dto.DocumentUploadResponse;
import com.gem.compliance.service.DocumentProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Document Intelligence", description = "Endpoints for uploading bidder documents and inspecting ingestion status")
public class DocumentController {

    private final DocumentProcessingService documentProcessingService;
    private final com.gem.compliance.repository.BidRepository bidRepository;
    private final com.gem.compliance.repository.TenderRepository tenderRepository;
    private final com.gem.compliance.service.UserService userService;
    private static final java.util.Set<String> ALLOWED_EXTENSIONS = java.util.Set.of(".pdf", ".doc", ".docx", ".xls", ".xlsx");
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024L; // 50MB

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'BIDDER_VENDOR', 'BIDDER', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN', 'ROLE_BIDDER_VENDOR', 'ROLE_BIDDER')")
    @Operation(summary = "Upload tender or bidder document", description = "Uploads PDF/DOCX tender or bidder document, calculates checksum hash, and creates processing job.")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "bidId", required = false) String bidId,
            @RequestParam(value = "tenderId", required = false) String tenderId
    ) {
        // Enforce strict bidder and tender ownership validation (Fix Issue 10 - IDOR)
        var currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            throw new org.springframework.security.access.AccessDeniedException("401 Unauthorized: Document upload requires an authenticated session.");
        }

        String role = currentUser.get().getRole() != null ? currentUser.get().getRole().toUpperCase() : "";
        String userEmail = currentUser.get().getEmail();

        if (bidId != null && !bidId.isBlank()) {
            var bidOpt = bidRepository.findById(bidId);
            if (bidOpt.isEmpty()) {
                throw new com.gem.compliance.exception.ResourceNotFoundException("Bid not found with ID: " + bidId);
            }
            if (role.contains("BIDDER")) {
                String ownerEmail = bidOpt.get().getBidderEmail();
                if (ownerEmail != null && !ownerEmail.equalsIgnoreCase(userEmail)) {
                    throw new org.springframework.security.access.AccessDeniedException(
                        "403 Forbidden: Mismatched ownership. Bid " + bidId + " does not belong to authenticated account " + userEmail
                    );
                }
            }
        } else if (tenderId != null && !tenderId.isBlank()) {
            if (role.contains("BIDDER")) {
                throw new org.springframework.security.access.AccessDeniedException(
                    "403 Forbidden: Bidders cannot upload tender-level specifications. Please associate your upload with a valid bidId."
                );
            }
        }
        if (file.isEmpty()) {
            throw new com.gem.compliance.exception.ValidationException("Uploaded file cannot be empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new com.gem.compliance.exception.ValidationException("File exceeds maximum allowed size of 50MB (received " + file.getSize() + " bytes).");
        }

        String rawFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        String cleanFilename = java.nio.file.Paths.get(rawFilename).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");

        String ext = "";
        int dotIdx = cleanFilename.lastIndexOf('.');
        if (dotIdx > 0) {
            ext = cleanFilename.substring(dotIdx).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new com.gem.compliance.exception.ValidationException("File extension '" + ext + "' is not permitted. Allowed: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        try {
            String fileType = file.getContentType() != null ? file.getContentType() : "application/pdf";
            byte[] bytes = file.getBytes();

            DocumentUploadResponse response = documentProcessingService.processDocumentUpload(cleanFilename, fileType, bytes, bidId, tenderId);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DocumentUploadResponse.builder()
                            .status("FAILED")
                            .message("Failed to upload document: " + e.getMessage())
                            .build());
        }
    }
}
