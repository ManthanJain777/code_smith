package com.gem.compliance.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContradictionResolveRequest {

    @Builder.Default
    @JsonAlias({"bidId", "bid_id"})
    private String bidId = "BID-APEX-001";

    @Builder.Default
    @JsonAlias({"requirementId", "requirement_id", "contradictionId", "contradiction_id"})
    private String requirementId = "REQ-FIN-TURNOVER";

    @Builder.Default
    @JsonAlias({"precedentDocumentName", "chosenPrecedentDoc", "precedent_document_name", "chosen_precedent_doc"})
    private String precedentDocumentName = "AUDITED_BALANCE_SHEET";

    @NotBlank(message = "Resolution rationale is mandatory")
    @Size(min = 15, message = "Resolution rationale must be at least 15 characters long")
    @JsonAlias({"rationale", "resolutionRationale", "resolution_rationale", "justification"})
    private String rationale;
}

