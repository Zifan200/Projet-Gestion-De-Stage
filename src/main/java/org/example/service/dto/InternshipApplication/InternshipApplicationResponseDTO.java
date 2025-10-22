package org.example.service.dto.InternshipApplication;


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
    private String studentFirstName;
    private String studentLastName;

    private Long selectedCvID;
    private String selectedCvFileName;
    private Long selectedCvFileSize;
    private byte[] selectedCvFileData;

    private Long internshipOfferId;
    private String internshipOfferTitle;
    //private String internshipOfferEmployerEmail;
    private LocalDate internshipOfferPublishedDate;
    private LocalDate internshipOfferExpirationDate;
    private String employerEmail;
    private ApprovalStatus status;
    private LocalDateTime createdAt;

    @Builder
    public InternshipApplicationResponseDTO(
            Long id, String studentEmail, String  studentFirstName, String studentLastName, Long selectedCvID, String selectedCvFileName, Long selectedCvFileSize, byte[] selectedCvFileData,
            Long internshipOfferId, String internshipOfferTitle, /*String internshipOfferEmployerEmail,*/
            LocalDate internshipOfferPublishedDate, LocalDate internshipOfferExpirationDate, String employerEmail, ApprovalStatus status, LocalDateTime createdAt

            ){
        this.id = id;
        this.studentEmail = studentEmail;
        this.studentFirstName = studentFirstName;
        this.studentLastName = studentLastName;
        this.selectedCvID = selectedCvID;
        this.selectedCvFileName = selectedCvFileName;
        this.selectedCvFileSize = selectedCvFileSize;
        this.selectedCvFileData = selectedCvFileData;
        this.internshipOfferId = internshipOfferId;
        this.internshipOfferTitle = internshipOfferTitle;
        //this.internshipOfferEmployerEmail = internshipOfferEmployerEmail;
        this.internshipOfferPublishedDate = internshipOfferPublishedDate;
        this.internshipOfferExpirationDate = internshipOfferExpirationDate;
        this.employerEmail = employerEmail;
        this.status = status;
        this.createdAt = createdAt;
    }
    //
    //added application details for the next backend prog or front end warrior (idk if it helps)
    //
    public static InternshipApplicationResponseDTO create(InternshipApplication internshipApplication){
        return InternshipApplicationResponseDTO.builder()
                .id(internshipApplication.getId())
                .studentEmail(internshipApplication.getStudent().getEmail())
                .studentFirstName(internshipApplication.getStudent().getFirstName())
                .studentLastName(internshipApplication.getStudent().getLastName())
                .employerEmail(internshipApplication.getOffer().getEmployer().getEmail())
                .internshipOfferId(internshipApplication.getOffer().getId())
                .selectedCvID(internshipApplication.getSelectedStudentCV().getId())
                .selectedCvFileName(internshipApplication.getSelectedStudentCV().getFileName())
                .selectedCvFileSize(internshipApplication.getSelectedStudentCV().getFileSize())
                .selectedCvFileData(internshipApplication.getSelectedStudentCV().getData())
                .internshipOfferId(internshipApplication.getOffer().getId())
                .internshipOfferTitle(internshipApplication.getOffer().getTitle())
                .internshipOfferPublishedDate(internshipApplication.getOffer().getPublishedDate())
                .internshipOfferExpirationDate(internshipApplication.getOffer().getExpirationDate())
                .status(internshipApplication.getStatus())
                .createdAt(internshipApplication.getCreatedAt())
                .build();
    }
}
