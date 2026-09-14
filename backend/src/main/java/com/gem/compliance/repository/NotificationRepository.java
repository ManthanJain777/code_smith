package com.gem.compliance.repository;

import com.gem.compliance.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);

    boolean existsByUserIdAndEventTypeAndIsReadFalse(String userId, String eventType);
    boolean existsByUserIdAndEventTypeAndResourceIdAndIsReadFalse(String userId, String eventType, String resourceId);
    boolean existsByUserIdAndEventTypeAndTitleAndIsReadFalse(String userId, String eventType, String title);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId")
    void markAllAsReadForUser(@Param("userId") String userId);
}
