package org.example.service.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.Employer;
import org.example.model.InternshipOffer;

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

    @Builder
    public InternshipOfferResponseDto(String title, String description, String target_programme,
                                      Employer employerEmail, LocalDate publishedDate, LocalDate expirationDate) {
        this.title = title;
        this.description = description;
        this.targetedProgramme = target_programme;
        this.employerEmail = employerEmail.getEmail();
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
    }

    @Builder(builderClassName = "FromEmployerResponseDtoBuilder", builderMethodName = "fromEmployerResponseDtoBuilder")
    public InternshipOfferResponseDto(String title, String description, String target_programme,
                                      EmployerResponseDto employerEmail, LocalDate publishedDate, LocalDate expirationDate) {
        this.title = title;
        this.description = description;
        this.targetedProgramme = target_programme;
        this.employerEmail = employerEmail.getEmail();
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
    }

    public static InternshipOfferResponseDto create(InternshipOffer internshipOffer) {
        return InternshipOfferResponseDto.builder()
                .title(internshipOffer.getTitle())
                .description(internshipOffer.getDescription())
                .target_programme(internshipOffer.getTargetedProgramme())
                .employerEmail(internshipOffer.getEmployer())
                .publishedDate(internshipOffer.getPublishedDate())
                .expirationDate(internshipOffer.getExpirationDate())
                .build();
    }

    public static InternshipOfferResponseDto empty() {
        return new InternshipOfferResponseDto();
    }
}
