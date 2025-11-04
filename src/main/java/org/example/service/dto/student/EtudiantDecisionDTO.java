package org.example.service.dto.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EtudiantDecisionDTO  {
    @NotBlank(message = "required: student email")
    @NotEmpty
    private String studentEmail;
    private String etudiantRaison;
}