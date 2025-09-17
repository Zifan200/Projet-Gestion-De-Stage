package org.example.service.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.Employer;

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
    private String targeted_programme;

    private Employer employer;
    private LocalDateTime publishedDate;
    private LocalDateTime expirationDate;

    @Builder
    public InternshipOfferDto(String title, String description, String target_programme,
                              Employer employer, LocalDateTime publishedDate, LocalDateTime expirationDate) {
        this.title = title;
        this.description = description;
        this.targeted_programme = target_programme;
        this.employer = employer;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
    }

    public InternshipOfferDto(){}

    public static InternshipOfferDto create(InternshipOfferDto internshipOfferDto) {
        return InternshipOfferDto.builder()
                .title(internshipOfferDto.getTitle())
                .description(internshipOfferDto.getDescription())
                .target_programme(internshipOfferDto.getTargeted_programme())
                .employer(internshipOfferDto.getEmployer())
                .publishedDate(internshipOfferDto.getPublishedDate())
                .expirationDate(internshipOfferDto.getExpirationDate())
                .build();
    }

    public static InternshipOfferDto empty() {
        return new InternshipOfferDto();
    }
}
