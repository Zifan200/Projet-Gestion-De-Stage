package org.example.service.dto.InternshipApplication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.InternshipApplication;
import org.example.model.enums.ApprovalStatus;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Data
public class InternshipApplicationDTO {
    private Long id;

    @NotBlank(message = "required: student email")
    @NotEmpty
    private String studentEmail;
    @NotNull(message = "required: CV id")
    private Long selectedCvID;
    @NotNull(message = "required: internship offer id")
    private Long  internshipOfferId;

    private ApprovalStatus status =  ApprovalStatus.PENDING;
    private LocalDateTime createdAt;

    @Builder
    public InternshipApplicationDTO(
            Long id, String studentEmail, Long selectedCvID, Long internshipOfferId, String employerEmail, ApprovalStatus status, LocalDateTime createdAt
    ){
        this.id = id;
        this.studentEmail = studentEmail;
        this.selectedCvID = selectedCvID;
        this.internshipOfferId = internshipOfferId;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static InternshipApplicationDTO create(InternshipApplication internshipApplication) {
        return InternshipApplicationDTO.builder()
                .id(internshipApplication.getId())
                .studentEmail(internshipApplication.getStudent().getEmail())
                .selectedCvID(internshipApplication.getSelectedStudentCV().getId())
                .internshipOfferId(internshipApplication.getOffer().getId())
                .status(internshipApplication.getStatus())
                .build();
    }

    public static InternshipApplicationDTO empty(){
        return new InternshipApplicationDTO();
    }
}
