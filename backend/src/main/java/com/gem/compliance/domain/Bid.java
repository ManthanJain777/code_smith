package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "bids")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bid {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "tender_id", nullable = false)
    private String tenderId;

    @Column(name = "bidder_name", nullable = false)
    private String bidderName;

    @Column(name = "bidder_gstin")
    private String bidderGstin;

    @Column(name = "bidder_pan")
    private String bidderPan;

    @Column(name = "bidder_email")
    private String bidderEmail;

    @Column(name = "bidder_phone")
    private String bidderPhone;

    @Column(name = "bidder_address", columnDefinition = "TEXT")
    private String bidderAddress;

    @Column(name = "status", length = 30)
    private String status; // SUBMITTED / UNDER_EVALUATION / COMPLETED / REJECTED

    @Column(name = "risk_score", precision = 5, scale = 2)
    private BigDecimal riskScore;

    @Column(name = "risk_factors", columnDefinition = "TEXT")
    private String riskFactors;

    @Column(name = "forgery_risk", precision = 5, scale = 3)
    private BigDecimal forgeryRisk;

    @Column(name = "debarment_status", length = 20)
    @Builder.Default
    private String debarmentStatus = "CLEAR";

    @Column(name = "collusion_flags", columnDefinition = "TEXT")
    private String collusionFlags;

    @Column(name = "quoted_price", precision = 15, scale = 2)
    private BigDecimal quotedPrice;

    @Column(name = "local_content_percent")
    private Integer localContentPercent;

    @Column(name = "emd_status", length = 30)
    private String emdStatus;

    @Column(name = "blockchain_tx", length = 66)
    private String blockchainTx;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
        if (updatedAt == null) updatedAt = ZonedDateTime.now();
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (status == null) status = "SUBMITTED";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
