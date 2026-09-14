package com.gem.compliance.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "copilot_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CopilotConfig {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String role;

    @Column(name = "persona_title", nullable = false)
    private String personaTitle;

    @Column(name = "system_prompt_template", columnDefinition = "TEXT", nullable = false)
    private String systemPromptTemplate;

    @Column(name = "allowed_scope", nullable = false)
    private String allowedScope; // ALL_BIDS, QUEUE_EXCEPTIONS, OWN_BID_ONLY, READ_ONLY_TRANSCRIPT

    @Column(name = "query_input_enabled", nullable = false)
    @Builder.Default
    private Boolean queryInputEnabled = true;

    @Column(name = "quick_questions", columnDefinition = "TEXT", nullable = false)
    private String quickQuestions; // JSON array

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
        if (updatedAt == null) updatedAt = ZonedDateTime.now();
    }
}
