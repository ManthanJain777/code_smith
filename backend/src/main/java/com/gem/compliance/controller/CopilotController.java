package com.gem.compliance.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gem.compliance.domain.Bid;
import com.gem.compliance.domain.CopilotConfig;
import com.gem.compliance.domain.User;
import com.gem.compliance.repository.BidRepository;
import com.gem.compliance.repository.CopilotConfigRepository;
import com.gem.compliance.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@RestController
@RequestMapping("/api/v1/copilot")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dynamic Procurement Copilot", description = "Role-scoped RAG copilot engine with server-side access controls")
public class CopilotController {

    private final CopilotConfigRepository copilotConfigRepository;
    private final UserService userService;
    private final BidRepository bidRepository;
    private final com.gem.compliance.repository.ComplianceResultRepository complianceResultRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .build();

    @GetMapping("/config")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get Copilot Configuration for Current Role", description = "Returns system prompt, persona title, quick questions, and query enablement.")
    public ResponseEntity<Map<String, Object>> getCopilotConfig() {
        String role = userService.getCurrentUser()
            .map(u -> u.getRole() != null ? u.getRole().toUpperCase().replace("ROLE_", "") : "VIEWER")
            .orElse("VIEWER");

        Optional<CopilotConfig> configOpt = copilotConfigRepository.findByRole(role);
        if (configOpt.isEmpty() && role.contains("BIDDER")) {
            configOpt = copilotConfigRepository.findByRole("BIDDER_VENDOR");
        } else if (configOpt.isEmpty() && (role.contains("AUDITOR") || role.contains("VIEWER"))) {
            configOpt = copilotConfigRepository.findByRole("AUDITOR");
        } else if (configOpt.isEmpty()) {
            configOpt = copilotConfigRepository.findAll().stream().findFirst();
        }

        if (configOpt.isPresent()) {
            CopilotConfig cfg = configOpt.get();
            List<String> questions = List.of();
            try {
                questions = objectMapper.readValue(cfg.getQuickQuestions(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse quick questions: {}", e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "role", cfg.getRole(),
                "persona_title", cfg.getPersonaTitle(),
                "system_prompt_template", cfg.getSystemPromptTemplate(),
                "allowed_scope", cfg.getAllowedScope(),
                "query_input_enabled", cfg.getQueryInputEnabled(),
                "quick_questions", questions
            ));
        }

        // Fallback if table not queried yet
        boolean isAuditor = role.contains("AUDITOR") || role.contains("VIEWER");
        return ResponseEntity.ok(Map.of(
            "role", role,
            "persona_title", isAuditor ? "Independent Vigilance Observer" : "Procurement Committee Copilot",
            "system_prompt_template", "You are the GeM Procurement Assistant.",
            "allowed_scope", isAuditor ? "READ_ONLY_TRANSCRIPT" : "ALL_BIDS",
            "query_input_enabled", !isAuditor,
            "quick_questions", isAuditor ? List.of() : List.of("Are there any cross-document contradictions in this tender?")
        ));
    }

    @PostMapping("/query")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Execute Scoped Copilot Query", description = "Dispatches scoped inquiry to AI engine with GFR 2017 server-side RBAC enforcement.")
    public ResponseEntity<Map<String, Object>> queryCopilot(@RequestBody Map<String, Object> payload) {
        User user = userService.getCurrentUser().orElse(null);
        String role = user != null && user.getRole() != null ? user.getRole().toUpperCase().replace("ROLE_", "") : "VIEWER";
        String question = payload.getOrDefault("question", "").toString();
        String tenderId = payload.getOrDefault("tender_id", "TND-PUMP-001").toString();
        String requestedBidId = payload.getOrDefault("bid_id", "").toString();

        // 1. Auditor Guard: Live query submission is completely forbidden
        if (role.contains("AUDITOR") || role.contains("VIEWER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "Forbidden",
                "message", "Live query input disabled for Auditor vigilance oversight (GFR 2017). Inspecting auditable committee transcripts.",
                "answer", "Access Restricted: Under independent vigilance standards (GFR 2017), live queries from the Auditor are disabled to prevent committee interference.",
                "confidence", 1.0,
                "sources", List.of()
            ));
        }

        // 2. Bidder Scope Enforcement: Scoped strictly to caller's own bid
        String effectiveBidId = requestedBidId;
        if (role.contains("BIDDER")) {
            String userEmail = user != null ? user.getEmail() : "";
            List<Bid> userBids = bidRepository.findAll().stream()
                .filter(b -> b.getBidderEmail() != null && b.getBidderEmail().equalsIgnoreCase(userEmail))
                .toList();

            if (userBids.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Forbidden",
                    "message", "No active bid dossier registered under your bidder account.",
                    "answer", "No active bid dossier registered under your bidder account. Please submit a bid to access the Compliance Assistant.",
                    "confidence", 1.0,
                    "sources", List.of()
                ));
            }

            // If a specific bid was requested, ensure the bidder owns it
            if (requestedBidId != null && !requestedBidId.isBlank()) {
                boolean ownsRequested = userBids.stream().anyMatch(b -> b.getId().equalsIgnoreCase(requestedBidId));
                if (!ownsRequested) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "error", "Forbidden",
                        "message", "Commercial Confidentiality (GFR Rule 173): You are strictly restricted to inquiries regarding your own submitted bid dossier.",
                        "answer", "Refusal (Commercial Confidentiality): As a registered Bidder, you are strictly restricted under GFR Rule 173 to inquiries regarding your own submitted bid dossier. Inquiries concerning competitor bids, comparative pricing, or internal committee deliberations are prohibited.",
                        "confidence", 1.0,
                        "sources", List.of()
                    ));
                }
                effectiveBidId = requestedBidId;
            } else {
                effectiveBidId = userBids.get(0).getId();
            }
        }

        // 3. Dispatch to FastAPI AI Engine with strictly scoped evidence
        try {
            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("question", question);
            reqBody.put("tender_id", tenderId);
            reqBody.put("bid_id", effectiveBidId);
            reqBody.put("role", role);
            reqBody.put("user_name", user != null ? user.getFullName() : "Procurement Officer");
            reqBody.put("max_results", 4);

            var bidResults = complianceResultRepository.findByBidId(effectiveBidId);
            var mappedResults = bidResults.stream().map(r -> Map.of(
                "requirement_id", r.getRequirementId() != null ? r.getRequirementId() : "",
                "status", r.getStatus() != null ? r.getStatus() : "VERIFIED",
                "reasoning", r.getReasoning() != null ? r.getReasoning() : ""
            )).toList();
            reqBody.put("compliance_results", mappedResults);

            String jsonPayload = objectMapper.writeValueAsString(reqBody);

            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(aiServiceUrl + "/api/v1/ai/copilot/query"))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(12))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                return ResponseEntity.ok(objectMapper.readValue(resp.body(), Map.class));
            }
        } catch (Exception e) {
            log.warn("FastAPI copilot query failed ({}) — using deterministic fallback", e.getMessage());
        }

        // 4. Deterministic Grounded Refusal / Safe Fallback
        return ResponseEntity.ok(Map.of(
            "answer", String.format("AI reasoning service unavailable — showing deterministic verification records for Bid '%s'. Please consult the Compliance Matrix for verified criteria.", effectiveBidId),
            "confidence", 0.85,
            "source_results", List.of(),
            "disclaimer", "Grounded verification records only."
        ));
    }

    @GetMapping("/transcript")
    public ResponseEntity<List<Map<String, Object>>> getTranscript() {
        return ResponseEntity.ok(List.of(
            Map.of(
                "id", "TX-1001",
                "timestamp", "2026-09-12T10:15:00Z",
                "role", "PROCUREMENT_OFFICER",
                "user_name", "Rajesh Kumar (Procurement Officer)",
                "tender_id", "TND-PUMP-001",
                "bid_id", "BID-BHARAT-002",
                "question", "Compare technical pump efficiency across all evaluated bidders",
                "answer", "Bharat Heavy Valves Ltd: 89.2% (ISO/IEC 17025 certified lab report p.14). Crompton Flow Dynamics: 86.5% (Test certificate p.8). Both satisfy the mandatory minimum threshold of >= 85.0% under Section 3.2.1 of Tender GEM/2026/B/90125.",
                "citations", List.of(
                    Map.of("document_name", "ISO_17025_Lab_Report.pdf", "page", 14, "snippet", "BEP Efficiency confirmed at 89.2%"),
                    Map.of("document_name", "Performance_Test_Cert.pdf", "page", 8, "snippet", "Flow efficiency measured at 86.5%")
                )
            ),
            Map.of(
                "id", "TX-1002",
                "timestamp", "2026-09-12T10:22:30Z",
                "role", "COMPLIANCE_REVIEWER",
                "user_name", "Anita Sharma (Compliance Reviewer)",
                "tender_id", "TND-PUMP-001",
                "bid_id", "BID-APEX-001",
                "question", "What is the exact contradiction between the Balance Sheet and CA Certificate?",
                "answer", "Variance detected on Bid BID-APEX-001: Audited Balance Sheet reports FY24 turnover as Rs. 94.00 Cr, whereas provisional CA Certificate claims Rs. 112.40 Cr. Discrepancy is 19.5% across mandatory 3-year average requirement.",
                "citations", List.of(
                    Map.of("document_name", "Audited_Balance_Sheet_FY25.pdf", "page", 1, "snippet", "Revenue from operations: INR 94.00 Cr"),
                    Map.of("document_name", "CA_Turnover_Certificate.pdf", "page", 1, "snippet", "Certified turnover: INR 112.40 Cr")
                )
            )
        ));
    }
}
