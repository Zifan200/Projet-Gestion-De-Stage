package org.example.service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.model.Etudiant;


import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class EtudiantDTO {
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le courriel est obligatoire")
    @Email(message = "Le courriel doit être valide")
    private String courriel;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "\\d{3}-\\d{3}-\\d{4}", message = "Le téléphone doit être au format 514-123-4567")
    private String telephone;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    @NotBlank(message = "Le programme est obligatoire")
    private String programme;

    @Min(value = 16, message = "L'étudiant doit avoir au moins 16 ans")
    private int age;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
            message = "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial"
    )
    private String motDePasse;

    private List<Long> ListCvId;

    public static Etudiant toEntity(EtudiantDTO dto) {
        Etudiant etudiant = new Etudiant();
        etudiant.setId(dto.getId());
        etudiant.setNom(dto.getNom());
        etudiant.setPrenom(dto.getPrenom());
        etudiant.setCourriel(dto.getCourriel());
        etudiant.setTelephone(dto.getTelephone());
        etudiant.setAdresse(dto.getAdresse());
        etudiant.setProgramme(dto.getProgramme());
        etudiant.setAge(dto.getAge());
        return etudiant;
    }

    public static EtudiantDTO fromEntity(Etudiant etudiant) {
        EtudiantDTO dto = new EtudiantDTO();
        dto.setId(etudiant.getId());
        dto.setNom(etudiant.getNom());
        dto.setPrenom(etudiant.getPrenom());
        dto.setCourriel(etudiant.getCourriel());
        dto.setTelephone(etudiant.getTelephone());
        dto.setAdresse(etudiant.getAdresse());
        dto.setProgramme(etudiant.getProgramme());
        dto.setAge(etudiant.getAge());
        if (etudiant.getCv() != null) {
            dto.setListCvId(etudiant.getCv()
                    .stream()
                    .map(cv -> cv.getId())
                    .toList());
        }
        return dto;
    }
}

