package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    private String id;

    @Column(nullable = false)
    private String role;

    @Column(name = "feature_key", nullable = false)
    private String featureKey;

    @Column(name = "access_level", nullable = false)
    private String accessLevel; // FULL, READ, OWN, SCOPED, READ_ONLY, BLOCKED

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
    }
}
