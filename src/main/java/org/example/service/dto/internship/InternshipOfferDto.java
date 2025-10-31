package org.example.service.dto.internship;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;
import org.example.service.dto.employer.EmployerResponseDto;

import java.time.LocalDate;

@Getter
@Data
@Builder
public class InternshipOfferDto {
    private Long id;
    @NotBlank(message = "required: title")
    @Size(min = 4)
    @NotEmpty
    private String title;

    @NotBlank(message = "required: description")
    @NotEmpty
    private String description;

    @NotBlank(message = "required: targeted programme")
    @NotEmpty
    private String targetedProgramme;

    @NotBlank(message = "required: employer email")
    @Email
    private String employerEmail;

    private LocalDate publishedDate;

    private LocalDate expirationDate;

    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;
    private String reason;

    @Builder
    public InternshipOfferDto(Long id, String title, String description, String targetedProgramme,
                              String employerEmail, LocalDate publishedDate, LocalDate expirationDate, ApprovalStatus status, String reason) {
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

    @Builder(builderClassName = "FromEmployerObjBuilder", builderMethodName = "fromEmployerObjBuilder")
    public InternshipOfferDto(Long id, String title, String description, String targetedProgramme,
                              Employer employer, LocalDate publishedDate, LocalDate expirationDate, ApprovalStatus status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.employerEmail = employer.getEmail();
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.status = status;
    }

    @Builder(builderClassName = "FromEmployerResponseDtoBuilder", builderMethodName = "fromEmployerResponseDtoBuilder")
    public InternshipOfferDto(Long id, String title, String description, String targetedProgramme,
                              EmployerResponseDto employer, LocalDate publishedDate, LocalDate expirationDate, ApprovalStatus status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.employerEmail = employer.getEmail();
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.status = status;
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
                .status(internshipOffer.getStatus())
                .reason(internshipOffer.getReason())
                .build();
    }

    public static InternshipOfferDto empty() {
        return new InternshipOfferDto();
    }
}
