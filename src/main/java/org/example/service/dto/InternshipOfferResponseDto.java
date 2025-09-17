package org.example.service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.Employer;

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

    public static InternshipOfferResponseDto create(InternshipOfferResponseDto internshipOfferDto) {
        return InternshipOfferResponseDto.builder()
                .title(internshipOfferDto.getTitle())
                .description(internshipOfferDto.getDescription())
                .target_programme(internshipOfferDto.getTargeted_programme())
                .employer(internshipOfferDto.getEmployer())
                .publishedDate(internshipOfferDto.getPublishedDate())
                .expirationDate(internshipOfferDto.getExpirationDate())
                .build();
    }

    public static InternshipOfferResponseDto empty() {
        return new InternshipOfferResponseDto();
    }
}
