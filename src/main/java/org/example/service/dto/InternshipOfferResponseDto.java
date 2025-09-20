package org.example.service.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.Employer;
import org.example.model.InternshipOffer;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Data
public class InternshipOfferResponseDto {

    private Long id;
    private String title;
    private String description;
    private String targeted_programme;
    private Employer employer;
    private LocalDateTime publishedDate;
    private LocalDateTime expirationDate;

    @Builder
    public InternshipOfferResponseDto(String title, String description, String target_programme,
                              Employer employer, LocalDateTime publishedDate, LocalDateTime expirationDate) {
        this.title = title;
        this.description = description;
        this.targeted_programme = target_programme;
        this.employer = employer;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
    }

    @Builder(builderClassName = "FromEmployerResponseDtoBuilder", builderMethodName = "fromEmployerResponseDtoBuilder")
    public InternshipOfferResponseDto(String title, String description, String target_programme,
                              EmployerResponseDto employer, LocalDateTime publishedDate, LocalDateTime expirationDate) {
        this.title = title;
        this.description = description;
        this.targeted_programme = target_programme;
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

    public static InternshipOfferResponseDto create(InternshipOffer internshipOffer) {
        return InternshipOfferResponseDto.builder()
                .title(internshipOffer.getTitle())
                .description(internshipOffer.getDescription())
                .target_programme(internshipOffer.getTargeted_programme())
                .employer(internshipOffer.getEmployer())
                .publishedDate(internshipOffer.getPublishedDate())
                .expirationDate(internshipOffer.getExpirationDate())
                .build();
    }

    public static InternshipOfferResponseDto empty() {
        return new InternshipOfferResponseDto();
    }
}
