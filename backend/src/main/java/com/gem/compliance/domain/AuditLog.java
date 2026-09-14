package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    private String id;

    @Column(name = "actor_id", nullable = false)
    private String actorId;

    @Column(name = "actor_role", nullable = false)
    private String actorRole;

    @Column(name = "organization_id")
    private String organizationId;

    @Column(nullable = false)
    private String action;

    @Column(name = "resource_type", nullable = false)
    private String resourceType;

    @Column(name = "resource_id", nullable = false)
    private String resourceId;

    private ZonedDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "tx_hash")
    private String txHash;

    @Column(name = "block_number")
    private Long blockNumber;

    @Column(name = "blockchain_anchored")
    private Boolean blockchainAnchored;

    @Column(name = "anchor_timestamp")
    private ZonedDateTime anchorTimestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) timestamp = ZonedDateTime.now();
    }
}
