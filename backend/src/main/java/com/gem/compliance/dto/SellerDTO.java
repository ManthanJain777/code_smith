package com.gem.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerDTO {
    private String id;
    private String organizationName;
    private String companyName;     // Alias for organizationName for frontend compatibility
    private String cinOrPan;
    private String pan;             // Extracted from cinOrPan for frontend compatibility
    private String gstin;
    private String udyamRegistration;
    private String dpiitNumber;
    private String bisLicense;
    private String epfoCode;
    private String registeredAddress;
    private String category;
    private Boolean isDebarred;
    private BigDecimal trustScore;
    private String verificationStatus;
    private String overallStatus;   // Computed: ACTIVE/HIGH_RISK/DEBARRED based on verificationStatus + isDebarred
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private List<VerificationResultDTO> verificationResults;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerificationResultDTO {
        private String connectorName;
        private String status;
        private String responseJson;
        private ZonedDateTime verifiedAt;
    }
}
