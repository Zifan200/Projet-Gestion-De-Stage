package org.example.service.dto.InternshipApplicaiton;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.InternshipApplication;
import org.example.model.enums.ApprovalStatus;
import org.example.service.dto.InternshipOfferDto;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Data
public class InternshipApplicationDto {
    private Long id;

    @NotBlank(message = "required: student email")
    @NotEmpty
    private String studentEmail;
    @NotBlank(message = "required: CV id")
    @NotEmpty
    private Long selectedCvID;
    @NotBlank(message = "required: internship offer id")
    @NotEmpty
    private Long  internshipOfferId;

    private ApprovalStatus status =  ApprovalStatus.PENDING;
    private LocalDateTime createdAt;

    @Builder
    public InternshipApplicationDto(
            Long id, String studentEmail, Long selectedCvID, Long internshipOfferId, ApprovalStatus status, LocalDateTime createdAt
    ){
        this.id = id;
        this.studentEmail = studentEmail;
        this.selectedCvID = selectedCvID;
        this.internshipOfferId = internshipOfferId;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static InternshipApplicationDto create(InternshipApplication internshipApplication) {
        return InternshipApplicationDto.builder()
                .id(internshipApplication.getId())
                .studentEmail(internshipApplication.getStudent().getEmail())
                .selectedCvID(internshipApplication.getSelectedStudentCV().getId())
                .status(internshipApplication.getStatus())
                .build();
    }

    public static InternshipApplicationDto empty(){
        return new InternshipApplicationDto();
    }
}
