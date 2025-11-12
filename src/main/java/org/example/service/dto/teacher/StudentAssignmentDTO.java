package org.example.service.dto.teacher;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAssignmentDTO {

    @NotNull(message = "L'ID du professeur est obligatoire")
    private Long teacherId;

    @NotNull(message = "L'ID de l'étudiant est obligatoire")
    private Long studentId;
}
