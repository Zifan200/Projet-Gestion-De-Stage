package org.example.service.dto;

import lombok.Builder;
import lombok.Data;
import org.example.model.Employer;
import org.example.model.auth.Role;

import java.time.LocalDate;

@Data
public class EmployerDto extends UserDTO {
    private LocalDate since;

    @Builder
    public EmployerDto(Long id, String firstName, String lastname, String email, Role role, LocalDate since) {
        super(id, firstName, lastname, email, role);
        this.since = since;
    }

    public EmployerDto() {}

    public static EmployerDto create(Employer employer) {
        return EmployerDto.builder()
                .id(employer.getId())
                .firstName(employer.getFirstName())
                .lastname(employer.getLastName())
                .email(employer.getEmail())
                .role(employer.getRole())
                .since(employer.getSince())
                .build();



    }

    public static EmployerDto empty() {
        return new EmployerDto();
    }
}
