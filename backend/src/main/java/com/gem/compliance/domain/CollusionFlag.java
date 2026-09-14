package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "collusion_flag")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollusionFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "bidder_id_a", nullable = false)
    private String bidderIdA;

    @Column(name = "bidder_id_b", nullable = false)
    private String bidderIdB;

    @Column(name = "shared_attribute_type", nullable = false)
    private String sharedAttributeType;

    @Column(name = "shared_value", nullable = false)
    private String sharedValue;

    @Column(name = "flagged_at", nullable = false)
    private ZonedDateTime flaggedAt;

    @Column(name = "investigation_status", nullable = false)
    private String investigationStatus;
}
