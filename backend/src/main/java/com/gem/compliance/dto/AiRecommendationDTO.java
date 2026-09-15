package com.gem.compliance.dto;

import lombok.*;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRecommendationDTO {
    private String bidId;
    private String recommendationType;   // RECOMMEND_QUALIFY, RECOMMEND_REJECT, REFER_FOR_REVIEW
    private String recommendation;       // Alias for UI (AWARD_RECOMMENDED, DISQUALIFIED)
    private String summary;
    private List<String> gaps;
    private List<String> riskFactors;    // Alias for UI
    private List<String> strengths;
    private List<String> keyPositives;   // Alias for UI
    private String basis;
    private double confidenceScore;
    private String disclaimer;
    private ZonedDateTime generatedAt;
}
