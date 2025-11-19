package org.example.service.dto.entente;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.model.auth.Role;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntenteGenerationRequestDTO {
    private Long id;
    private InternshipApplicationResponseDTO application;
    private Long gestionnaireId;
    private Long employerId;
    private Long etudiantId;
    private Role role;
    private String signatureGestionnaire;
    private String signatureEmployer;
    private String signatureEtudiant;
}