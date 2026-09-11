package com.gem.compliance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HumanReviewRequest {
    @NotBlank(message = "Compliance result ID is required")
    private String complianceResultId;

    @NotBlank(message = "Reviewer ID is required")
    private String reviewerId;

    @NotBlank(message = "Final status is required")
    private String finalStatus; // COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, UNVERIFIED, NOT_APPLICABLE

    @NotBlank(message = "Reviewer justification note is mandatory")
    @Size(min = 15, message = "Reviewer justification note must be at least 15 characters long")
    private String reviewerNote;
}
