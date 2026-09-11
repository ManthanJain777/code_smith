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
    private String summary;
    private List<String> gaps;
    private List<String> strengths;
    private String basis;
    private double confidenceScore;
    private String disclaimer;
    private ZonedDateTime generatedAt;
}
