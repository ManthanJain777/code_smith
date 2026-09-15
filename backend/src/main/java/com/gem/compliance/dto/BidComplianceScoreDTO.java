package com.gem.compliance.dto;

import lombok.*;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidComplianceScoreDTO {
    private String bidId;
    private double complianceScore;          // 0–100 percent
    private String riskLevel;               // LOW, MEDIUM, HIGH, CRITICAL
    private int totalRequirements;
    private int compliantCount;
    private int partiallyCompliantCount;
    private int nonCompliantCount;
    private int unverifiedCount;
    private int notApplicableCount;
    private int pendingHumanReviewCount;
    private Double overallScore;
    private Double riskScore;
    private Double technicalScore;
    private Double financialScore;
    private Double statutoryScore;
    private String status;
    private String recommendation;
    private String disqualificationReason;
    private ZonedDateTime computedAt;
}
