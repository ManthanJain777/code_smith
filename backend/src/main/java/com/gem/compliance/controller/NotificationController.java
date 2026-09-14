package com.gem.compliance.controller;

import com.gem.compliance.domain.Notification;
import com.gem.compliance.service.NotificationService;
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

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification System", description = "Role-specific real-time alert notifications for officers, reviewers, auditors, bidders, and admins")
public class NotificationController {

    private final NotificationService notificationService;

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
    @Operation(summary = "Get notifications for current user", description = "Returns active notifications addressed to the current authenticated user.")
    public ResponseEntity<List<NotificationItem>> getNotifications() {
        List<Notification> list = notificationService.getNotificationsForCurrentUser();
        List<NotificationItem> items = list.stream().map(n -> NotificationItem.builder()
            .id(n.getId())
            .title(n.getTitle())
            .message(n.getMessage())
            .type(n.getType())
            .timestamp(n.getCreatedAt() != null ? n.getCreatedAt().toString() : "")
            .read(Boolean.TRUE.equals(n.getIsRead()))
            .actionUrl(n.getActionUrl())
            .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(items);
    }

    @PostMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read", description = "Marks all notifications for current user as read.")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "All notifications marked as read"));
    }
}
