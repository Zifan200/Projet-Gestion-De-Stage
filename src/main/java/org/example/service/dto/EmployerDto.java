package org.example.service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.model.Employer;
import org.example.model.auth.Role;

import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Data
public class EmployerDto extends UserDTO {
    private LocalDate since;
    @NotBlank(message = "Enterprise name is mandatory")
    @NotEmpty
    private String enterpriseName;
    @Min(8)
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone is not valid")
    private String phone;

    @Builder
    public EmployerDto(Long id, String firstName, String lastName, String email, String password, Role role, LocalDate since, String enterpriseName, String phone) {
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
