package org.example.service.dto.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.example.model.Etudiant;
import org.example.model.auth.Role;
import org.example.service.dto.util.UserDTO;


import java.time.LocalDate;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class EtudiantDTO extends UserDTO {

    private LocalDate since;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "\\d{3}-\\d{3}-\\d{4}", message = "Le téléphone doit être au format 514-123-4567")
    private String phone;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    @NotBlank(message = "Le programme est obligatoire")
    private String program;

    private List<Long> ListCvId;
    private int numberOfApplications;

    public EtudiantDTO() {

    }

    @Builder
    public EtudiantDTO(Long id, String firstName, String lastName, String email, Role role,
                       LocalDate since, String phone, String adresse, String program, String password, int numberOfApplications) {
        super(id, firstName, lastName, email, password, role);
        this.since = since;
        this.phone = phone;
        this.adresse = adresse;
        this.program = program;
        this.numberOfApplications = numberOfApplications;
    }

    public static Etudiant toEntity(EtudiantDTO dto) {
        return Etudiant.builder()
                .id(dto.getId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .phone(dto.getPhone())
                .adresse(dto.getAdresse())
                .program(dto.getProgram())
                .build();
    }

    public static EtudiantDTO fromEntity(Etudiant etudiant) {
        return EtudiantDTO
                .builder()
                .id(etudiant.getId())
                .firstName(etudiant.getFirstName())
                .lastName(etudiant.getLastName())
                .email(etudiant.getEmail())
                .password(etudiant.getPassword())
                .role(etudiant.getRole())
                .since(etudiant.getSince())
                .phone(etudiant.getPhone())
                .program(etudiant.getProgram())
                .adresse(etudiant.getAdresse())
                .numberOfApplications(etudiant.getApplications().size())
                .build();
    }

    public static EtudiantDTO empty() {
        return new EtudiantDTO();
    }
}

