package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "override_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverrideLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "actor_id", nullable = false)
    private String actorId;

    @Column(name = "result_id", nullable = false)
    private String resultId;

    @Column(name = "before_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ComplianceStatus beforeStatus;

    @Column(name = "after_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ComplianceStatus afterStatus;

    @Column(name = "justification_text", nullable = false, length = 1000)
    private String justificationText;

    @Column(name = "timestamp", nullable = false)
    private ZonedDateTime timestamp;

    @Column(name = "tx_hash")
    private String txHash;
}
