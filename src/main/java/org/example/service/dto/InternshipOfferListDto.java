package org.example.service.dto;

import lombok.Builder;
import lombok.Data;
import org.example.model.enums.InternshipOfferStatus;

import java.time.LocalDate;

@Data
@Builder
public class InternshipOfferListDto {
    private Long id;
    private String title;
    private String enterpriseName;
    private LocalDate expirationDate;
    private String targetedProgramme;
    private InternshipOfferStatus status;
    private String reason;
    private Integer applicationCount;
}
