package com.gem.compliance.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceResultDTO {
    private String id;
    private String requirementId;
    private String requirementCode;
    private String requirementText;
    private String category;
    private String bidId;
    private String status; // COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, UNVERIFIED, NOT_APPLICABLE
    private String verificationMethod; // DETERMINISTIC, AI_LANGUAGE, HYBRID
    private String reasoning;
    private BigDecimal confidence;
    private String evidenceIds;
    private String reviewStatus;
    private Boolean humanOverridden;
    private String reviewerNotes;
    private String blockchainTxHash;
    private java.util.List<java.util.Map<String, Object>> evidenceCitations;
    private ZonedDateTime createdAt;
}
