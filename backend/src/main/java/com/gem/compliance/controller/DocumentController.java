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

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('PROCUREMENT_OFFICER', 'SYSTEM_ADMIN', 'BIDDER_VENDOR', 'ROLE_PROCUREMENT_OFFICER', 'ROLE_SYSTEM_ADMIN', 'ROLE_BIDDER_VENDOR')")
    @Operation(summary = "Upload tender or bidder document", description = "Uploads PDF/DOCX tender or bidder document, calculates checksum hash, and creates processing job.")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "bidId", required = false) String bidId,
            @RequestParam(value = "tenderId", required = false) String tenderId
    ) {
        try {
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
            String fileType = file.getContentType() != null ? file.getContentType() : "application/pdf";
            byte[] bytes = file.getBytes();

            DocumentUploadResponse response = documentProcessingService.processDocumentUpload(filename, fileType, bytes, bidId, tenderId);
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
