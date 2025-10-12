package org.example.service.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.example.model.enums.InternshipOfferStatus;

import java.time.LocalDate;

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
    private InternshipOfferStatus status;
    private String reason;

    @Builder
 
    public InternshipOfferResponseDto(Long id, String title, String description, String target_programme,
                                      String employerEmail, LocalDate publishedDate, LocalDate expirationDate, InternshipOfferStatus status, String reason) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.employerEmail = employerEmail;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.status = status;
        this.reason = reason;
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
                .build();
    }

    public static InternshipOfferResponseDto empty() {
        return new InternshipOfferResponseDto();
    }
}
