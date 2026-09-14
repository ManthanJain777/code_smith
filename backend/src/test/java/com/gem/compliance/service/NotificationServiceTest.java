package com.gem.compliance.service;

import com.gem.compliance.domain.Notification;
import com.gem.compliance.domain.User;
import com.gem.compliance.repository.NotificationRepository;
import com.gem.compliance.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id("USR-OFFICER-001")
            .email("officer@gembid.local")
            .fullName("Smt. Sunita Rao")
            .role("PROCUREMENT_OFFICER")
            .isActive(true)
            .build();
    }

    @Test
    void testPublishEvent_createsPerUserIdNotification() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));
        when(notificationRepository.existsByUserIdAndEventTypeAndResourceIdAndIsReadFalse(anyString(), anyString(), anyString()))
            .thenReturn(false);

        notificationService.publishEvent(
            "NEW_BID_SUBMITTED",
            "New Bid Received",
            "Apex Pumps submitted a bid",
            "INFO",
            "/compliance?bidId=BID-001",
            "PROCUREMENT_OFFICER",
            "BID-001"
        );

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals("USR-OFFICER-001", saved.getUserId());
        assertEquals("PROCUREMENT_OFFICER", saved.getRole());
        assertEquals("NEW_BID_SUBMITTED", saved.getEventType());
        assertEquals("BID-001", saved.getResourceId());
        assertFalse(saved.getIsRead());
    }

    @Test
    void testPublishEvent_deduplicatesUnreadNotification() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));
        // Simulate that an unread notification with same event_type and resourceId already exists
        when(notificationRepository.existsByUserIdAndEventTypeAndResourceIdAndIsReadFalse("USR-OFFICER-001", "HEALTH_CHECK_FAILURE", "SRV-POSTGRES"))
            .thenReturn(true);

        notificationService.publishEvent(
            "HEALTH_CHECK_FAILURE",
            "Database Connectivity Warning",
            "PostgreSQL latency threshold exceeded",
            "CRITICAL",
            "/admin",
            "PROCUREMENT_OFFICER",
            "SRV-POSTGRES"
        );

        // Verification: No new notification should be saved due to de-duplication guard
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void testGetNotificationsForCurrentUser() {
        when(userService.getCurrentUser()).thenReturn(Optional.of(testUser));
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("USR-OFFICER-001"))
            .thenReturn(List.of(
                Notification.builder().id("NTF-01").userId("USR-OFFICER-001").title("Welcome").build()
            ));

        List<Notification> results = notificationService.getNotificationsForCurrentUser();
        assertEquals(1, results.size());
        assertEquals("NTF-01", results.get(0).getId());
    }

    @Test
    void testMarkAllAsRead() {
        when(userService.getCurrentUser()).thenReturn(Optional.of(testUser));

        notificationService.markAllAsRead();
        verify(notificationRepository, times(1)).markAllAsReadForUser("USR-OFFICER-001");
    }
}
