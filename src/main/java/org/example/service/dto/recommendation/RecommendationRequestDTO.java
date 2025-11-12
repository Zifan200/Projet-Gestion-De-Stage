package org.example.service.dto.recommendation;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.enums.PriorityCode;

@NoArgsConstructor
@Getter
@Data
public class RecommendationRequestDTO {

    @NotNull(message = "required: student id")
    private Long studentId;

    @NotNull(message = "required: offer id")
    private Long offerId;

    @NotNull(message = "required: priority code")
    private PriorityCode priorityCode;

    @Builder
    public RecommendationRequestDTO(
        Long studentId,
        Long offerId,
        PriorityCode priorityCode
    ) {
        this.studentId = studentId;
        this.offerId = offerId;
        this.priorityCode = priorityCode;
    }
}
