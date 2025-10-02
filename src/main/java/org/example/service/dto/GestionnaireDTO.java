package org.example.service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.model.Gestionnaire;
import org.example.model.auth.Role;

@EqualsAndHashCode(callSuper = true)
@Data
public class GestionnaireDTO extends UserDTO {

    @Min(8)
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone is not valid")
    private String phone;

    @Builder
    public GestionnaireDTO(Long id, String lastName, String firstName, String email,
                           String password, Role role, String phone) {
        super(id, lastName, firstName, email, password, role);
        this.phone = phone;
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
                .build();
    }

    public static GestionnaireDTO empty() {return new GestionnaireDTO();}
}
