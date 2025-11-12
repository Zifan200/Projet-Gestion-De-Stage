package org.example.service.dto.internshipApplication;


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
    private String studentProgrammeName;

    private Long selectedCvID;
    private String selectedCvFileName;
    private Long selectedCvFileSize;
    private byte[] selectedCvFileData;
    private String selectedCvFileType;

    private Long internshipOfferId;
    private String internshipOfferTitle;
    private String internshipOfferDescription;
    private LocalDate internshipOfferPublishedDate;
    private LocalDate internshipOfferExpirationDate;
    private String employerEmail;
    private float salary;

    private ApprovalStatus status;
    private ApprovalStatus etudiantStatus;
    private LocalDateTime createdAt;
    private LocalDate startDate;
    private String session;
    private String reason;
    private String etudiantRaison;

    @Builder
    public InternshipApplicationResponseDTO(
            Long id,
            String studentEmail,
            String studentFirstName,
            String studentLastName,
            String studentProgrammeName,
            Long selectedCvID,
            String selectedCvFileName,
            Long selectedCvFileSize,
            byte[] selectedCvFileData,
            String selectedCvFileType,
            Long internshipOfferId,
            String internshipOfferTitle,
            String internshipOfferDescription,
            LocalDate internshipOfferPublishedDate,
            LocalDate internshipOfferExpirationDate,
            String employerEmail,
            float salary,
            ApprovalStatus status,
            ApprovalStatus etudiantStatus,
            LocalDateTime createdAt,
            LocalDate startDate,
            String session,
            String reason,
            String etudiantRaison
    ) {
        this.id = id;
        this.studentEmail = studentEmail;
        this.studentFirstName = studentFirstName;
        this.studentLastName = studentLastName;
        this.studentProgrammeName = studentProgrammeName;
        this.selectedCvID = selectedCvID;
        this.selectedCvFileName = selectedCvFileName;
        this.selectedCvFileSize = selectedCvFileSize;
        this.selectedCvFileData = selectedCvFileData;
        this.selectedCvFileType = selectedCvFileType;
        this.internshipOfferId = internshipOfferId;
        this.internshipOfferTitle = internshipOfferTitle;
        this.internshipOfferDescription = internshipOfferDescription;
        this.internshipOfferPublishedDate = internshipOfferPublishedDate;
        this.internshipOfferExpirationDate = internshipOfferExpirationDate;
        this.employerEmail = employerEmail;
        this.salary = salary;
        this.status = status;
        this.etudiantStatus = etudiantStatus;
        this.createdAt = createdAt;
        this.startDate = startDate;
        this.session = session;
        this.reason = reason;
        this.etudiantRaison = etudiantRaison;
    }

    public static InternshipApplicationResponseDTO create(InternshipApplication internshipApplication) {
        return InternshipApplicationResponseDTO.builder()
                .id(internshipApplication.getId())
                .studentEmail(internshipApplication.getStudent().getEmail())
                .studentFirstName(internshipApplication.getStudent().getFirstName())
                .studentLastName(internshipApplication.getStudent().getLastName())
                .studentProgrammeName(internshipApplication.getStudent().getProgram())
                .employerEmail(internshipApplication.getOffer().getEmployer().getEmail())
                .internshipOfferId(internshipApplication.getOffer().getId())
                .selectedCvID(internshipApplication.getSelectedStudentCV().getId())
                .selectedCvFileName(internshipApplication.getSelectedStudentCV().getFileName())
                .selectedCvFileSize(internshipApplication.getSelectedStudentCV().getFileSize())
                .selectedCvFileData(internshipApplication.getSelectedStudentCV().getData())
                .selectedCvFileType(internshipApplication.getSelectedStudentCV().getFileType())
                .internshipOfferTitle(internshipApplication.getOffer().getTitle())
                .internshipOfferDescription(internshipApplication.getOffer().getDescription())
                .internshipOfferPublishedDate(internshipApplication.getOffer().getPublishedDate())
                .internshipOfferExpirationDate(internshipApplication.getOffer().getExpirationDate())
                .salary(internshipApplication.getOffer().getSalary())
                .status(internshipApplication.getStatus())
                .etudiantStatus(internshipApplication.getEtudiantStatus())
                .createdAt(internshipApplication.getCreatedAt())
                .startDate(internshipApplication.getStartDate())
                .session(internshipApplication.getSession())
                .reason(internshipApplication.getReason())
                .etudiantRaison(internshipApplication.getEtudiantRaison())
                .build();
    }
}
