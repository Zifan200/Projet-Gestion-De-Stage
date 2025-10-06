package org.example.service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.model.Gestionnaire;
import org.example.model.auth.Role;

import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Data
public class GestionnaireDTO extends UserDTO {

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "\\d{3}-\\d{3}-\\d{4}", message = "Le téléphone doit être au format 514-123-4567")
    private String phone;

    private LocalDate since;

    @Builder
    public GestionnaireDTO(Long id, String lastName, String firstName, String email,
                           String password, Role role, String phone, LocalDate since) {
        super(id, lastName, firstName, email, password, role);
        this.phone = phone;
        this.since = since;
    }

    public GestionnaireDTO() {}

    public static GestionnaireDTO fromEntity(Gestionnaire gestionnaire) {
        return GestionnaireDTO.builder()
                .id(gestionnaire.getId())
                .firstName(gestionnaire.getFirstName())
                .lastName(gestionnaire.getLastName())
                .email(gestionnaire.getEmail())
                .password(gestionnaire.getPassword())
                .role(gestionnaire.getRole())
                .phone(gestionnaire.getPhone())
                .since(gestionnaire.getSince())
                .build();
    }

    public static GestionnaireDTO empty() {return new GestionnaireDTO();}
}
