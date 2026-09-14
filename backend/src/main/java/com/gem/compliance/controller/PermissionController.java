package com.gem.compliance.controller;

import com.gem.compliance.domain.Permission;
import com.gem.compliance.repository.PermissionRepository;
import com.gem.compliance.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
@Tag(name = "Dynamic Permissions Engine", description = "Dynamic feature entitlement and permission querying")
public class PermissionController {

    private final PermissionRepository permissionRepository;
    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user permissions", description = "Returns dynamic feature permissions and access levels for the authenticated role.")
    public ResponseEntity<Map<String, String>> getMyPermissions() {
        String role = userService.getCurrentUser()
            .map(u -> u.getRole() != null ? u.getRole().toUpperCase().replace("ROLE_", "") : "VIEWER")
            .orElse("VIEWER");

        List<Permission> permissions = permissionRepository.findByRole(role);
        Map<String, String> permMap = new HashMap<>();

        for (Permission p : permissions) {
            permMap.put(p.getFeatureKey(), p.getAccessLevel());
        }

        // Fallback defaults if not seeded
        if (permMap.isEmpty()) {
            if (role.contains("ADMIN")) {
                permMap.put("admin_dashboard", "FULL");
                permMap.put("tender_spec", "FULL");
                permMap.put("compliance_matrix", "FULL");
                permMap.put("portal_verification", "FULL");
                permMap.put("multi_bidder_compare", "FULL");
                permMap.put("copilot_query", "FULL");
                permMap.put("seller_queue", "FULL");
                permMap.put("human_review", "FULL");
                permMap.put("compliance_reports", "FULL");
                permMap.put("analytics_overview", "FULL");
                permMap.put("blockchain_audit", "FULL");
                permMap.put("bid_upload", "FULL");
                permMap.put("contradiction_resolve", "FULL");
            } else if (role.contains("PROCUREMENT_OFFICER")) {
                permMap.put("admin_dashboard", "BLOCKED");
                permMap.put("tender_spec", "FULL");
                permMap.put("compliance_matrix", "FULL");
                permMap.put("portal_verification", "FULL");
                permMap.put("multi_bidder_compare", "FULL");
                permMap.put("copilot_query", "FULL");
                permMap.put("seller_queue", "FULL");
                permMap.put("human_review", "FULL");
                permMap.put("compliance_reports", "FULL");
                permMap.put("analytics_overview", "FULL");
                permMap.put("blockchain_audit", "FULL");
                permMap.put("bid_upload", "BLOCKED");
                permMap.put("contradiction_resolve", "BLOCKED");
            } else if (role.contains("REVIEWER")) {
                permMap.put("admin_dashboard", "BLOCKED");
                permMap.put("tender_spec", "READ");
                permMap.put("compliance_matrix", "READ");
                permMap.put("portal_verification", "READ");
                permMap.put("multi_bidder_compare", "BLOCKED");
                permMap.put("copilot_query", "SCOPED");
                permMap.put("seller_queue", "READ");
                permMap.put("human_review", "FULL");
                permMap.put("compliance_reports", "READ");
                permMap.put("analytics_overview", "BLOCKED");
                permMap.put("blockchain_audit", "BLOCKED");
                permMap.put("bid_upload", "BLOCKED");
                permMap.put("contradiction_resolve", "FULL");
            } else if (role.contains("AUDITOR")) {
                permMap.put("admin_dashboard", "BLOCKED");
                permMap.put("tender_spec", "READ");
                permMap.put("compliance_matrix", "READ");
                permMap.put("portal_verification", "BLOCKED");
                permMap.put("multi_bidder_compare", "BLOCKED");
                permMap.put("copilot_query", "READ_ONLY");
                permMap.put("seller_queue", "BLOCKED");
                permMap.put("human_review", "BLOCKED");
                permMap.put("compliance_reports", "READ");
                permMap.put("analytics_overview", "BLOCKED");
                permMap.put("blockchain_audit", "FULL");
                permMap.put("bid_upload", "BLOCKED");
                permMap.put("contradiction_resolve", "BLOCKED");
            } else {
                // BIDDER_VENDOR
                permMap.put("admin_dashboard", "BLOCKED");
                permMap.put("tender_spec", "READ");
                permMap.put("compliance_matrix", "OWN");
                permMap.put("portal_verification", "BLOCKED");
                permMap.put("multi_bidder_compare", "BLOCKED");
                permMap.put("copilot_query", "SCOPED");
                permMap.put("seller_queue", "BLOCKED");
                permMap.put("human_review", "BLOCKED");
                permMap.put("compliance_reports", "OWN");
                permMap.put("analytics_overview", "BLOCKED");
                permMap.put("blockchain_audit", "BLOCKED");
                permMap.put("bid_upload", "FULL");
                permMap.put("contradiction_resolve", "BLOCKED");
            }
        }

        return ResponseEntity.ok(permMap);
    }
}
