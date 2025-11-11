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
    private Integer applicationCount;
    private LocalDate publishedDate;
    private LocalDate expirationDate;

    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;

    private String reason;
    private LocalDate startDate;
    private LocalDate EndDate;
    private String session;
    private float salary;


    @Builder
    public InternshipOfferDto(Long id, String title, String description, String targetedProgramme,
                              String employerEmail, Integer applicationCount, LocalDate publishedDate,
                              LocalDate expirationDate, ApprovalStatus status, String reason, LocalDate startDate,
                              LocalDate EndDate, String session, float salary) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.employerEmail = employerEmail;
        this.applicationCount = applicationCount;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.status = status;
        this.reason = reason;
        this.startDate = startDate;
        this.EndDate = EndDate;
        this.session = session;
        this.salary = salary;
    }

    public InternshipOfferDto() {}

    public static InternshipOfferDto create(InternshipOffer internshipOffer) {
        return InternshipOfferDto.builder()
                .id(internshipOffer.getId())
                .title(internshipOffer.getTitle())
                .description(internshipOffer.getDescription())
                .targetedProgramme(internshipOffer.getTargetedProgramme())
                .employerEmail(internshipOffer.getEmployer().getEmail())
                .applicationCount(internshipOffer.getApplications().size())
                .publishedDate(internshipOffer.getPublishedDate())
                .expirationDate(internshipOffer.getExpirationDate())
                .status(internshipOffer.getStatus())
                .reason(internshipOffer.getReason())
                .startDate(internshipOffer.getStartDate())
                .EndDate(internshipOffer.getEndDate())
                .session(internshipOffer.getSession())
                .salary(internshipOffer.getSalary())
                .build();
    }

    public static InternshipOfferDto empty() {
        return new InternshipOfferDto();
    }
}
