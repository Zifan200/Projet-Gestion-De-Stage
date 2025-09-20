package org.example.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import org.example.model.Employer;
import org.example.model.InternshipOffer;

import java.time.LocalDateTime;

@Getter
@Data
public class InternshipOfferDto {
    private Long id;
    @NotBlank(message = "Le \"title\" est obligatoire")
    @NotEmpty
    private String title;
    @NotBlank(message = "Le \"description\" est obligatoire")
    @NotEmpty
    private String description;
    @NotBlank(message = "Le \"targeted programme\" est obligatoire")
    @NotEmpty
    private String targetedProgramme;

    @NotBlank(message = "Le \"employer email\" est obligatoire")
    @NotEmpty
    private String employerEmail;

    @NotBlank(message = "Le \"published date\" est obligatoire")
    @NotEmpty
    private LocalDateTime publishedDate;

    private LocalDateTime expirationDate;

    @Builder
    public InternshipOfferDto(Long id, String title, String description, String targetedProgramme,
                              String employerEmail, LocalDateTime publishedDate, LocalDateTime expirationDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.employerEmail = employerEmail;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
    }

    @Builder(builderClassName = "FromEmployerObjBuilder", builderMethodName = "fromEmployerObjBuilder")
    public InternshipOfferDto(Long id, String title, String description, String targetedProgramme,
                              Employer employer, LocalDateTime publishedDate, LocalDateTime expirationDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.employerEmail = employer.getEmail();
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
    }

    @Builder(builderClassName = "FromEmployerResponseDtoBuilder", builderMethodName = "fromEmployerResponseDtoBuilder")
    public InternshipOfferDto(Long id, String title, String description, String targetedProgramme,
                              EmployerResponseDto employer, LocalDateTime publishedDate, LocalDateTime expirationDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.employerEmail = employer.getEmail();
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
    }

    public InternshipOfferDto(){}

    public static InternshipOfferDto create(InternshipOffer internshipOffer) {
        return InternshipOfferDto.builder()
                .id(internshipOffer.getId())
                .title(internshipOffer.getTitle())
                .description(internshipOffer.getDescription())
                .targetedProgramme(internshipOffer.getTargetedProgramme())
                .employerEmail(internshipOffer.getEmployer().getEmail())
                .publishedDate(internshipOffer.getPublishedDate())
                .expirationDate(internshipOffer.getExpirationDate())
                .build();
    }

    public static InternshipOfferDto empty() {
        return new InternshipOfferDto();
    }
}
