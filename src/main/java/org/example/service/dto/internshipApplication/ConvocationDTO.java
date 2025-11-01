package org.example.service.dto.internshipApplication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.Convocation;
import org.example.model.enums.ApprovalStatus;
import org.springframework.lang.Nullable;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Data
public class ConvocationDTO {
    private Long id;

    @NotBlank(message = "required: student email")
    @NotEmpty
    private String studentEmail;

    @NotBlank(message = "required: student email")
    @NotEmpty
    private String employerEmail;

    private ApprovalStatus status =  ApprovalStatus.PENDING;

    private LocalDateTime convocationDate;

    @Nullable
    private String location;
    @Nullable
    private String link;

    @NotBlank(message = "required: internship application id")
    private Long internshipApplicationId;

    @Builder
    public ConvocationDTO (Long id, String studentEmail, String employerEmail, ApprovalStatus status,
                           LocalDateTime convocationDate, String location, String link, Long internshipApplicationId) {
        this.id = id;
        this.studentEmail = studentEmail;
        this.employerEmail = employerEmail;
        this.status = status;
        this.convocationDate = convocationDate;
        this.location = location;
        this.link = link;
        this.internshipApplicationId = internshipApplicationId;
    }

    public static ConvocationDTO convertToDTO (Convocation convocation) {
        return ConvocationDTO.builder()
                .id(convocation.getId())
                .studentEmail(convocation.getEtudiant().getEmail())
                .employerEmail(convocation.getEmployer().getEmail())
                .status(convocation.getStatus())
                .convocationDate(convocation.getDateConvocation())
                .location(convocation.getLocation())
                .link(convocation.getLink())
                .internshipApplicationId(convocation.getInternshipApplication().getId())
                .build();
    }

    public static ConvocationDTO empty() {return new ConvocationDTO();}
}
