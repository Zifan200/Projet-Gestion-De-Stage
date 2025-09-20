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
    private Employer employer;

    @NotBlank(message = "Le \"published date\" est obligatoire")
    @NotEmpty
    private LocalDateTime publishedDate;

    private LocalDateTime expirationDate;

    @Builder
    public InternshipOfferDto(Long id, String title, String description, String targetedProgramme,
                              Employer employer, LocalDateTime publishedDate, LocalDateTime expirationDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.employer = employer;
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
        this.employer = Employer.builder()
                .firstName(employer.getFirstName())
                .lastName(employer.getLastName())
                .email(employer.getEmail())
                .enterpriseName(employer.getEnterpriseName())
                .phone(employer.getPhone())
                .since(employer.getSince())
                .build();
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
                .employer(internshipOffer.getEmployer())
                .publishedDate(internshipOffer.getPublishedDate())
                .expirationDate(internshipOffer.getExpirationDate())
                .build();
    }

    public static InternshipOfferDto empty() {
        return new InternshipOfferDto();
    }
}
