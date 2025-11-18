package org.example.service.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.model.Etudiant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAssignmentResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String program;
    private Long professorId;
    private Long assignmentId;
    private Boolean notificationFailed;

    public static StudentAssignmentResponseDTO fromEntity(Etudiant etudiant) {
        return StudentAssignmentResponseDTO.builder()
            .id(etudiant.getId())
            .firstName(etudiant.getFirstName())
            .lastName(etudiant.getLastName())
            .email(etudiant.getEmail())
            .program(etudiant.getProgram())
            .professorId(etudiant.getTeacher() != null ? etudiant.getTeacher().getId() : null)
            .assignmentId(null) // Will be set if we track assignment history
            .notificationFailed(false) // Will be set based on notification status
            .build();
    }
}
