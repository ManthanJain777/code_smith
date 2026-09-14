package com.gem.compliance.controller;

import com.gem.compliance.service.GeminiApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Google Gemini AI & OCR Service", description = "AI Copilot inquiries and Multimodal Document OCR using Google Gemini API")
public class AiController {

    private final GeminiApiService geminiApiService;

    @GetMapping("/health")
    @Operation(summary = "AI Service Health", description = "Health status of AI and Gemini connectors")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "gemini-ai-service",
                "features", List.of("copilot-query", "multimodal-document-ocr", "gfr2017-grounding"),
                "timestamp", new Date().toString()
        ));
    }

    @PostMapping("/copilot/query")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Query Copilot via Gemini", description = "Executes GFR 2017 procurement inquiry with Gemini API grounding")
    public ResponseEntity<Map<String, Object>> queryCopilot(@RequestBody Map<String, Object> payload) {
        String question = payload.getOrDefault("question", "").toString();
        String tenderId = payload.getOrDefault("tender_id", "TND-PUMP-001").toString();
        String bidId = payload.getOrDefault("bid_id", "").toString();
        String role = payload.getOrDefault("role", "PROCUREMENT_OFFICER").toString();
        String userName = payload.getOrDefault("user_name", "Officer").toString();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> complianceResults = (List<Map<String, Object>>) payload.getOrDefault("compliance_results", List.of());

        Map<String, Object> response = geminiApiService.queryCopilot(question, tenderId, bidId, role, userName, complianceResults);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ocr/extract")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Multimodal Document OCR Extraction via Gemini", description = "Extracts statutory document fields (GSTN, PAN, CIN, EPFO, etc.) using Gemini Multimodal Vision API")
    public ResponseEntity<Map<String, Object>> extractDocumentOcr(@RequestBody Map<String, Object> payload) {
        String portalKey = payload.getOrDefault("portalKey", "GSTN").toString();
        String documentType = payload.getOrDefault("documentType", "Statutory Document").toString();
        String fileContent = payload.getOrDefault("fileContent", "").toString();
        String optionalText = payload.getOrDefault("text", "").toString();

        Map<String, Object> result = geminiApiService.extractStatutoryDocumentOcr(portalKey, documentType, fileContent, optionalText);
        return ResponseEntity.ok(result);
    }
}
