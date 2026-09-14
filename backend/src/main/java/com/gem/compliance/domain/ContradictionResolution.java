package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "contradiction_resolutions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContradictionResolution {

    @Id
    private String id;

    @Column(name = "bid_id", nullable = false)
    private String bidId;

    @Column(name = "requirement_id", nullable = false)
    private String requirementId;

    @Column(name = "precedent_document", nullable = false)
    private String precedentDocument;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String rationale;

    @Column(name = "resolved_by", nullable = false)
    private String resolvedBy;

    @Column(name = "resolved_at")
    private ZonedDateTime resolvedAt;

    @Column(name = "tx_hash")
    private String txHash;

    @Column(name = "block_number")
    private Long blockNumber;

    @PrePersist
    protected void onCreate() {
        if (resolvedAt == null) {
            resolvedAt = ZonedDateTime.now();
        }
    }
}
