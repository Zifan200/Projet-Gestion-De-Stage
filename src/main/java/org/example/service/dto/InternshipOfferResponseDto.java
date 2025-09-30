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

    @Builder
    public InternshipOfferResponseDto(Long id, String title, String description, String target_programme,
                                      Employer employerEmail, LocalDate publishedDate, LocalDate expirationDate, InternshipOfferStatus status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = target_programme;
        this.employerEmail = employerEmail.getEmail();
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.status = status;
    }

    @Builder(builderClassName = "FromEmployerResponseDtoBuilder", builderMethodName = "fromEmployerResponseDtoBuilder")
    public InternshipOfferResponseDto(Long id, String title, String description, String target_programme,
                                      EmployerResponseDto employerEmail, LocalDate publishedDate, LocalDate expirationDate, InternshipOfferStatus status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = target_programme;
        this.employerEmail = employerEmail.getEmail();
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.status = status;
    }

    public static InternshipOfferResponseDto create(InternshipOffer internshipOffer) {
        return InternshipOfferResponseDto.builder()
                .id(internshipOffer.getId())
                .title(internshipOffer.getTitle())
                .description(internshipOffer.getDescription())
                .target_programme(internshipOffer.getTargetedProgramme())
                .employerEmail(internshipOffer.getEmployer())
                .publishedDate(internshipOffer.getPublishedDate())
                .expirationDate(internshipOffer.getExpirationDate())
                .status(internshipOffer.getStatus())
                .build();
    }

    public static InternshipOfferResponseDto empty() {
        return new InternshipOfferResponseDto();
    }
}
