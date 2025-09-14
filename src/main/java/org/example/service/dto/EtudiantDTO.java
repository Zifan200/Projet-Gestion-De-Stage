package org.example.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.model.Etudiant;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class EtudiantDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String courriel;
    private String telephone;
    private String adresse;
    private String programme;
    private int age;
    private Long cvId;

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
        if (etudiant.getCv() != null && !etudiant.getCv().isEmpty()) {
            dto.setCvId(etudiant.getCv().get(0).getId()); // Assuming one CV per student for simplicity
        }
        return dto;
    }
}

