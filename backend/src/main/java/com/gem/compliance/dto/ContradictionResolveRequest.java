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

    @NotBlank(message = "Bid ID is mandatory")
    @JsonAlias({"bidId", "bid_id"})
    private String bidId;

    @NotBlank(message = "Requirement ID / Contradiction ID is mandatory")
    @JsonAlias({"requirementId", "requirement_id", "contradictionId", "contradiction_id"})
    private String requirementId;

    @JsonAlias({"precedentDocumentName", "chosenPrecedentDoc", "precedent_document_name", "chosen_precedent_doc"})
    private String precedentDocumentName;

    @NotBlank(message = "Resolution rationale is mandatory")
    @Size(min = 15, message = "Resolution rationale must be at least 15 characters long")
    @JsonAlias({"rationale", "resolutionRationale", "resolution_rationale", "justification"})
    private String rationale;
}

