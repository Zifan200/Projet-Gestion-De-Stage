package org.example.service.dto.internship;

import lombok.Builder;
import lombok.Data;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;

import java.time.LocalDate;

@Data
@Builder
public class InternshipOfferListDto {
    private Long id;
    private String title;
    private String enterpriseName;
    private String description;
    private LocalDate expirationDate;
    private String targetedProgramme;
    private ApprovalStatus status;
    private String reason;


    public static InternshipOfferListDto create(InternshipOffer internshipOffers) {
        return InternshipOfferListDto.builder()
                .id(internshipOffers.getId())
                .title(internshipOffers.getTitle())
                .enterpriseName("N/A")
                .expirationDate(internshipOffers.getExpirationDate())
                .targetedProgramme(internshipOffers.getTargetedProgramme())
                .status(internshipOffers.getStatus())
                .reason(internshipOffers.getReason())
                .build();
    }
    private Integer applicationCount;
}
