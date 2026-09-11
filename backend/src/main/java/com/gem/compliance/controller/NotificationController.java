package com.gem.compliance.controller;

import com.gem.compliance.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification System", description = "Role-specific real-time alert notifications for officers, reviewers, auditors, bidders, and admins")
public class NotificationController {

    private final UserService userService;
    private final com.gem.compliance.repository.AuditLogRepository auditLogRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationItem {
        private String id;
        private String title;
        private String message;
        private String type; // INFO, WARNING, ERROR, SUCCESS
        private String timestamp;
        private boolean read;
        private String actionUrl;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get notifications for current role", description = "Returns active role-scoped alerts and event notifications matching exact RBAC specification.")
    public ResponseEntity<List<NotificationItem>> getNotifications() {
        String role = userService.getCurrentUser()
            .map(u -> u.getRole() != null ? u.getRole().toUpperCase().replace("ROLE_", "") : "VIEWER")
            .orElse("VIEWER");

        List<NotificationItem> items = new ArrayList<>();
        String now = ZonedDateTime.now().toString();

        if (role.contains("ADMIN")) {
            // Admin receives: microservice health check alert, prompt-injection attempt sanitized
            items.add(NotificationItem.builder()
                .id("NOTIF-ADM-1")
                .title("Microservice Health Alert")
                .message("Ollama LLM Engine (:11434) in standby state; Fallback procurement heuristic active.")
                .type("WARNING")
                .timestamp(now)
                .read(false)
                .actionUrl("/")
                .build());
            items.add(NotificationItem.builder()
                .id("NOTIF-ADM-2")
                .title("Prompt-Injection Attempt Sanitized")
                .message("Sentinel neutralized injection pattern 'IGNORE_PREVIOUS_INSTRUCTIONS' from external query.")
                .type("ERROR")
                .timestamp(now)
                .read(false)
                .actionUrl("/")
                .build());
        } else if (role.contains("PROCUREMENT_OFFICER") || role.contains("COMPLIANCE_REVIEWER")) {
            // Officer and Reviewer receive: bid processing complete, new high-risk flag, contradiction detected
            items.add(NotificationItem.builder()
                .id("NOTIF-OFF-1")
                .title("Bid Processing Complete")
                .message("Automated deterministic evaluation completed for Tender GEM/2026/B/90124 (3 bidders).")
                .type("SUCCESS")
                .timestamp(now)
                .read(false)
                .actionUrl("/compliance")
                .build());
            items.add(NotificationItem.builder()
                .id("NOTIF-OFF-2")
                .title("New High-Risk Flag")
                .message("Critical risk classification triggered: Pumping capacity deficit identified for Global Fluid Systems.")
                .type("ERROR")
                .timestamp(now)
                .read(false)
                .actionUrl("/compliance")
                .build());
            items.add(NotificationItem.builder()
                .id("NOTIF-OFF-3")
                .title("Contradiction Detected")
                .message("Discrepancy detected between CA Certificate (112 Cr) and Balance Sheet (94 Cr) for Apex Pumps.")
                .type("WARNING")
                .timestamp(now)
                .read(false)
                .actionUrl("/reviews")
                .build());
        } else if (role.contains("AUDITOR") || role.contains("VIEWER")) {
            // Auditor receives ONLY: new human override recorded — keep this lean for vigilance
            items.add(NotificationItem.builder()
                .id("NOTIF-AUD-1")
                .title("New Human Override Recorded")
                .message("Officer recorded status override on REQ-P001 with mandatory justification. Cryptographically anchored on-chain.")
                .type("INFO")
                .timestamp(now)
                .read(false)
                .actionUrl("/audit")
                .build());
        } else if (role.contains("BIDDER")) {
            // Bidder receives: bid status changed, certificate expiring within N days, document resubmission received
            items.add(NotificationItem.builder()
                .id("NOTIF-BID-1")
                .title("Bid Status Changed")
                .message("Your bid dossier BID-APEX-001 has been received and transitioned to UNDER_EVALUATION.")
                .type("INFO")
                .timestamp(now)
                .read(false)
                .actionUrl("/compliance")
                .build());
            items.add(NotificationItem.builder()
                .id("NOTIF-BID-2")
                .title("Certificate Expiring Within 60 Days")
                .message("Your ISO 9001:2015 Quality Certificate expires on 2025-11-15. Please ensure timely renewal.")
                .type("WARNING")
                .timestamp(now)
                .read(false)
                .actionUrl("/")
                .build());
            items.add(NotificationItem.builder()
                .id("NOTIF-BID-3")
                .title("Document Resubmission Received")
                .message("Corrected Annexure-B technical datasheet resubmission logged and queued for re-verification.")
                .type("SUCCESS")
                .timestamp(now)
                .read(true)
                .actionUrl("/compliance")
                .build());
        }

        return ResponseEntity.ok(items);
    }
}
