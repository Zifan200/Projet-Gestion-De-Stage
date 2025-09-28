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
    private boolean attachmentPresent;
    //optional single file upload for the offer
    private String fileName;
    private String fileType;
    private Long fileSize;
    private byte[] fileData;

    @Builder
    public InternshipOfferResponseDto(Long id,String title, String description, String target_programme,
                                      Employer employerEmail, LocalDate publishedDate, LocalDate expirationDate, boolean attachmentPresent,
                                      String fileName, String fileType, Long fileSize, byte[] fileData
                                      ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = target_programme;
        this.employerEmail = employerEmail.getEmail();
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.attachmentPresent = attachmentPresent;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.fileData = fileData;
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
                .attachmentPresent(internshipOffer.isAttachmentPresent())
                .fileName(internshipOffer.getFileName())
                .fileType(internshipOffer.getFileType())
                .fileSize(internshipOffer.getFileSize())
                .fileData(internshipOffer.getFileData())
                .build();
    }

    public static InternshipOfferResponseDto empty() {
        return new InternshipOfferResponseDto();
    }
}
