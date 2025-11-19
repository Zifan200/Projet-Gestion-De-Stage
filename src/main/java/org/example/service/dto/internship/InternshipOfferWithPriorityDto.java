package org.example.service.dto.internship;

import lombok.Builder;
import lombok.Data;
import org.example.model.enums.ApprovalStatus;
import org.example.model.enums.PriorityCode;

import java.time.LocalDate;

@Data
@Builder
public class InternshipOfferWithPriorityDto {
    private Long id;
    private String title;
    private String enterpriseName;
    private String description;
    private LocalDate expirationDate;
    private String targetedProgramme;
    private ApprovalStatus status;
    private String reason;
    private Integer applicationCount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String session;

    // Champs de recommandation
    private PriorityCode priorityCode;  // null si non recommandé
    private Long recommendationId;      // null si non recommandé
    private boolean isRecommended;      // true si recommandé
}
