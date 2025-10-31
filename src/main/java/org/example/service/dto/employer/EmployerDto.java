package org.example.service.dto.employer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.model.Employer;
import org.example.model.auth.Role;
import org.example.service.dto.util.UserDTO;

import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Data
public class EmployerDto extends UserDTO {
    private LocalDate since;
    @NotBlank(message = "Enterprise name is mandatory")
    @NotEmpty
    private String enterpriseName;
    @Pattern(regexp = "\\d{3}-\\d{3}-\\d{4}", message = "Le téléphone doit être au format 514-123-4567")
    private String phone;

    @Builder
    public EmployerDto(Long id, String firstName, String lastName, String email, String password, Role role,
                       LocalDate since, String enterpriseName, String phone) {
        super(id, firstName, lastName, email, password, role);
        this.since = since;
        this.enterpriseName = enterpriseName;
        this.phone = phone;
    }

    public EmployerDto() {}

    public static EmployerDto create(Employer employer) {
        return EmployerDto.builder()
                .id(employer.getId())
                .firstName(employer.getFirstName())
                .lastName(employer.getLastName())
                .email(employer.getEmail())
                .password(employer.getPassword())
                .role(employer.getRole())
                .since(employer.getSince())
                .enterpriseName(employer.getEnterpriseName())
                .phone(employer.getPhone())
                .build();
    }

    public static EmployerDto empty() {
        return new EmployerDto();
    }
}
