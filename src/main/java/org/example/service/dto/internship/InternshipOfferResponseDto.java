package org.example.service.dto.internship;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;

import java.time.LocalDate;
import java.util.Date;

@NoArgsConstructor
@Getter
@Data
public class InternshipOfferResponseDto {

    private Long id;
    private String title;
    private String description;
    private String targetedProgramme;
    private String employerEmail;
    private LocalDate publishedDate;
    private LocalDate expirationDate;
    private ApprovalStatus status;
    private String reason;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String session;

    @Builder
    public InternshipOfferResponseDto(Long id, String title, String description, String targetedProgramme,
                                      String employerEmail, LocalDate publishedDate, LocalDate expirationDate,
                                      ApprovalStatus status, String reason, LocalDate dateDebut, LocalDate dateFin, String session) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.employerEmail = employerEmail;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.status = status;
        this.reason = reason;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.session = session;
    }

    public static InternshipOfferResponseDto create(InternshipOffer internshipOffer) {
        return InternshipOfferResponseDto.builder()
                .id(internshipOffer.getId())
                .title(internshipOffer.getTitle())
                .description(internshipOffer.getDescription())
                .targetedProgramme(internshipOffer.getTargetedProgramme())
                .employerEmail(internshipOffer.getEmployer().getEmail())
                .publishedDate(internshipOffer.getPublishedDate())
                .expirationDate(internshipOffer.getExpirationDate())
                .status(internshipOffer.getStatus())
                .reason(internshipOffer.getReason())
                .dateDebut(internshipOffer.getDateDebut())
                .dateFin(internshipOffer.getDateFin())
                .session(internshipOffer.getSession())
                .build();
    }

    public static InternshipOfferResponseDto empty() {
        return new InternshipOfferResponseDto();
    }
}
