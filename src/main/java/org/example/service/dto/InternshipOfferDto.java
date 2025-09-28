package org.example.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import org.example.model.InternshipOffer;

import java.time.LocalDate;

@Getter
@Data
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

    private LocalDate publishedDate;
    private LocalDate expirationDate;
    private boolean hasAttachment;
    //optional single file upload for the offer
    private String fileName;
    private String fileType;
    private Long fileSize;
    private byte[] fileData;

    @Builder
    public InternshipOfferDto(Long id, String title, String description, String targetedProgramme,
                            LocalDate publishedDate, LocalDate expirationDate, boolean hasAttachment,
                              String fileName, String fileType, Long fileSize, byte[] fileData) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.hasAttachment = hasAttachment;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.fileData = fileData;
    }



    public InternshipOfferDto(){}

    public static InternshipOfferDto create(InternshipOffer internshipOffer) {
        return InternshipOfferDto.builder()
                .id(internshipOffer.getId())
                .title(internshipOffer.getTitle())
                .description(internshipOffer.getDescription())
                .targetedProgramme(internshipOffer.getTargetedProgramme())
                .publishedDate(internshipOffer.getPublishedDate())
                .expirationDate(internshipOffer.getExpirationDate())
                .hasAttachment(internshipOffer.isHasAttachment())
                .fileName(internshipOffer.getFileName())
                .fileType(internshipOffer.getFileType())
                .fileSize(internshipOffer.getFileSize())
                .fileData(internshipOffer.getFileData())
                .build();
    }

    public static InternshipOfferDto empty() {
        return new InternshipOfferDto();
    }
}
