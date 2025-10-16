package org.example.service.dto.InternshipApplicaiton;


import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.InternshipApplication;
import org.example.model.enums.ApprovalStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Data
public class InternshipApplicationResponseDTO {

    private Long id;
    private String studentEmail;

    private Long selectedCvID;
    private String selectedCvFileName;
    private Long selectedCvFileSize;

    private Long internshipOfferId;
    private String internshipOfferTitle;
    private String internshipOfferEmployerEmail;
    private LocalDate internshipOfferPublishedDate;
    private LocalDate internshipOfferExpirationDate;

    private ApprovalStatus status =  ApprovalStatus.PENDING;
    private LocalDateTime createdAt;

    @Builder
    public InternshipApplicationResponseDTO(
            Long id, String studentEmail, Long selectedCvID, String selectedCvFileName, Long selectedCvFileSize,
            Long internshipOfferId, String internshipOfferTitle, String internshipOfferEmployerEmail,
            LocalDate internshipOfferPublishedDate, LocalDate internshipOfferExpirationDate, ApprovalStatus status, LocalDateTime createdAt

            ){
        this.id = id;
        this.studentEmail = studentEmail;
        this.selectedCvID = selectedCvID;
        this.selectedCvFileName = selectedCvFileName;
        this.selectedCvFileSize = selectedCvFileSize;
        this.internshipOfferId = internshipOfferId;
        this.internshipOfferTitle = internshipOfferTitle;
        this.internshipOfferEmployerEmail = internshipOfferEmployerEmail;
        this.internshipOfferPublishedDate = internshipOfferPublishedDate;
        this.internshipOfferExpirationDate = internshipOfferExpirationDate;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static InternshipApplicationResponseDTO create(InternshipApplication internshipApplication){
        return InternshipApplicationResponseDTO.builder()
                .id(internshipApplication.getId())
                .status(internshipApplication.getStatus())
                .studentEmail(internshipApplication.getStudent().getEmail())
                .internshipOfferId(internshipApplication.getOffer().getId())
                .selectedCvID(internshipApplication.getSelectedStudentCV().getId())
                .selectedCvFileName(internshipApplication.getSelectedStudentCV().getFileName())
                .selectedCvFileSize(internshipApplication.getSelectedStudentCV().getFileSize())
                .internshipOfferId(internshipApplication.getOffer().getId())
                .internshipOfferTitle(internshipApplication.getOffer().getTitle())
                .internshipOfferPublishedDate(internshipApplication.getOffer().getPublishedDate())
                .internshipOfferExpirationDate(internshipApplication.getOffer().getExpirationDate())
                .createdAt(internshipApplication.getCreatedAt())
                .build();
    }
}
