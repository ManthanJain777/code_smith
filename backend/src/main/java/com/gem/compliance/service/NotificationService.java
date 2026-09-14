package com.gem.compliance.service;

import com.gem.compliance.domain.Notification;
import com.gem.compliance.domain.User;
import com.gem.compliance.repository.NotificationRepository;
import com.gem.compliance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public void publishEvent(
        String eventType,
        String title,
        String message,
        String type,
        String actionUrl,
        String targetRole,
        String resourceId
    ) {
        // Resolve target users strictly per user_id
        List<User> targetUsers;
        if (targetRole != null && !targetRole.isBlank()) {
            String cleanRole = targetRole.toUpperCase().replace("ROLE_", "");
            targetUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().toUpperCase().replace("ROLE_", "").equalsIgnoreCase(cleanRole))
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .toList();
        } else {
            targetUsers = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .toList();
        }

        for (User user : targetUsers) {
            String userId = user.getId();

            // De-duplication Guard:
            // Check for existing unread notification with same event_type + related entity/title
            boolean duplicateExists = false;
            if (resourceId != null && !resourceId.isBlank()) {
                duplicateExists = notificationRepository.existsByUserIdAndEventTypeAndResourceIdAndIsReadFalse(userId, eventType, resourceId);
            } else {
                duplicateExists = notificationRepository.existsByUserIdAndEventTypeAndTitleAndIsReadFalse(userId, eventType, title);
            }

            if (duplicateExists) {
                log.debug("Suppressing duplicate unread notification: userId={} eventType={} resourceId={}", userId, eventType, resourceId);
                continue;
            }

            String notifId = "NTF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Notification notification = Notification.builder()
                .id(notifId)
                .userId(userId)
                .role(user.getRole() != null ? user.getRole().toUpperCase().replace("ROLE_", "") : "VIEWER")
                .eventType(eventType)
                .title(title)
                .message(message)
                .type(type != null ? type.toUpperCase() : "INFO")
                .actionUrl(actionUrl)
                .resourceId(resourceId)
                .isRead(false)
                .createdAt(ZonedDateTime.now())
                .build();

            notificationRepository.save(notification);
            log.info("Published notification: id={} userId={} eventType={}", notifId, userId, eventType);
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForCurrentUser() {
        return userService.getCurrentUser()
            .map(u -> notificationRepository.findByUserIdOrderByCreatedAtDesc(u.getId()))
            .orElseGet(Collections::emptyList);
    }

    @Transactional
    public void markAllAsRead() {
        userService.getCurrentUser().ifPresent(u -> {
            notificationRepository.markAllAsReadForUser(u.getId());
        });
    }
}
