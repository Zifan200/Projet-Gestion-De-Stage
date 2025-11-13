package org.example.service.dto.internshipApplication;


import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.InternshipApplication;
import org.example.model.enums.ApprovalStatus;
import org.example.model.enums.TypeHoraire;

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
    private String employerFirstName;
    private String employerLastName;
    private String employerEnterpriseName;
    private String employerAddress;
    private float salary;
    private TypeHoraire typeHoraire;
    private float nbHeures;
    private String address;

    private ApprovalStatus status;
    private ApprovalStatus etudiantStatus;
    private ApprovalStatus postInterviewStatus;
    private LocalDateTime createdAt;
    private LocalDate startDate;
    private LocalDate endDate;
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
            String employerFirstName,
            String employerLastName,
            String employerEnterpriseName,
            String employerAddress,
            float salary,
            TypeHoraire typeHoraire,
            float nbHeures,
            String address,
            ApprovalStatus status,
            ApprovalStatus etudiantStatus,
            ApprovalStatus postInterviewStatus,
            LocalDateTime createdAt,
            LocalDate startDate,
            LocalDate endDate,
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
        this.employerFirstName = employerFirstName;
        this.employerLastName = employerLastName;
        this.employerEnterpriseName = employerEnterpriseName;
        this.employerAddress = employerAddress;
        this.salary = salary;
        this.typeHoraire = typeHoraire;
        this.nbHeures = nbHeures;
        this.address = address;
        this.status = status;
        this.etudiantStatus = etudiantStatus;
        this.postInterviewStatus = postInterviewStatus;
        this.createdAt = createdAt;
        this.startDate = startDate;
        this.endDate = endDate;
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
                .employerEmail(internshipApplication.getOffer().getEmployer().getEmail())
                .employerFirstName(internshipApplication.getOffer().getEmployer().getFirstName())
                .employerLastName(internshipApplication.getOffer().getEmployer().getLastName())
                .employerEnterpriseName(internshipApplication.getOffer().getEmployer().getEnterpriseName())
                .salary(internshipApplication.getOffer().getSalary())
                .typeHoraire(internshipApplication.getOffer().getTypeHoraire())
                .nbHeures(internshipApplication.getOffer().getNbHeures())
                .employerAddress(internshipApplication.getOffer().getAddress())
                .status(internshipApplication.getStatus())
                .etudiantStatus(internshipApplication.getEtudiantStatus())
                .postInterviewStatus(internshipApplication.getPostInterviewStatus())
                .createdAt(internshipApplication.getCreatedAt())
                .startDate(internshipApplication.getStartDate())
                .endDate(internshipApplication.getOffer().getEndDate())
                .session(internshipApplication.getSession())
                .reason(internshipApplication.getReason())
                .etudiantRaison(internshipApplication.getEtudiantRaison())
                .build();
    }
}
