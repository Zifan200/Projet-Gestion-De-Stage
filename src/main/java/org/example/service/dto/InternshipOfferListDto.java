package org.example.service.dto;

import lombok.Builder;
import lombok.Data;
import org.example.model.InternshipOffer;
import org.example.model.enums.InternshipOfferStatus;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class InternshipOfferListDto {
    private Long id;
    private String title;
    private String enterpriseName;
    private String description;
    private LocalDate expirationDate;
    private String targetedProgramme;
    private InternshipOfferStatus status;
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
