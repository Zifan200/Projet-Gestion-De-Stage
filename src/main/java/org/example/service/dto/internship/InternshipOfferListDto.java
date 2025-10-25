package org.example.service.dto.internship;

import lombok.Builder;
import lombok.Data;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;

import java.time.LocalDate;
import java.util.Date;

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
    private Integer applicationCount;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String session;

    public static InternshipOfferListDto create(InternshipOffer internshipOffer) {
        return InternshipOfferListDto.builder()
                .id(internshipOffer.getId())
                .title(internshipOffer.getTitle())
                .enterpriseName(
                        internshipOffer.getEmployer() != null && internshipOffer.getEmployer().getEnterpriseName() != null
                                ? internshipOffer.getEmployer().getEnterpriseName()
                                : "N/A"
                )
                .description(internshipOffer.getDescription())
                .expirationDate(internshipOffer.getExpirationDate())
                .targetedProgramme(internshipOffer.getTargetedProgramme())
                .status(internshipOffer.getStatus())
                .reason(internshipOffer.getReason())
                .dateDebut(internshipOffer.getDateDebut())
                .dateFin(internshipOffer.getDateFin())
                .session(internshipOffer.getSession())
                .build();
    }
}
