package org.example.service.dto.recommendation;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.InternshipRecommendation;
import org.example.model.enums.PriorityCode;
import org.example.service.dto.internship.InternshipOfferDto;
import org.example.service.dto.student.EtudiantDTO;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Data
public class RecommendationResponseDTO {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long offerId;
    private String offerTitle;
    private Long gestionnaireId;
    private String gestionnaireName;
    private PriorityCode priorityCode;
    private LocalDateTime recommendedAt;
    private LocalDateTime updatedAt;

    @Builder
    public RecommendationResponseDTO(
            Long id,
            Long studentId,
            String studentName,
            Long offerId,
            String offerTitle,
            Long gestionnaireId,
            String gestionnaireName,
            PriorityCode priorityCode,
            LocalDateTime recommendedAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.offerId = offerId;
        this.offerTitle = offerTitle;
        this.gestionnaireId = gestionnaireId;
        this.gestionnaireName = gestionnaireName;
        this.priorityCode = priorityCode;
        this.recommendedAt = recommendedAt;
        this.updatedAt = updatedAt;
    }

    public static RecommendationResponseDTO create(InternshipRecommendation recommendation) {
        return RecommendationResponseDTO.builder()
                .id(recommendation.getId())
                .studentId(recommendation.getStudent().getId())
                .studentName(recommendation.getStudent().getFirstName() + " " + recommendation.getStudent().getLastName())
                .offerId(recommendation.getOffer().getId())
                .offerTitle(recommendation.getOffer().getTitle())
                .gestionnaireId(recommendation.getGestionnaire().getId())
                .gestionnaireName(recommendation.getGestionnaire().getFirstName() + " " + recommendation.getGestionnaire().getLastName())
                .priorityCode(recommendation.getPriorityCode())
                .recommendedAt(recommendation.getRecommendedAt())
                .updatedAt(recommendation.getUpdatedAt())
                .build();
    }
}
