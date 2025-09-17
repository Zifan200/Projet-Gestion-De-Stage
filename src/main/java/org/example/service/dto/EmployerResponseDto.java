package org.example.service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import org.example.model.Employer;
import org.example.model.auth.Role;

import java.time.LocalDate;


@Getter
@Data
public class EmployerResponseDto {
    private String firstName;
    private String lastName;
    private String email;
    private LocalDate since;
    private String enterpriseName;
    private String phone;

    @Builder
    public EmployerResponseDto(String firstName, String lastName, String email, LocalDate since, String enterpriseName, String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.since = since;
        this.enterpriseName = enterpriseName;
        this.phone = phone;
    }

    public EmployerResponseDto() {}

    public static EmployerResponseDto create(Employer employer) {
        return EmployerResponseDto.builder()
                .firstName(employer.getFirstName())
                .lastName(employer.getLastName())
                .email(employer.getEmail())
                .since(employer.getSince())
                .enterpriseName(employer.getEnterpriseName())
                .phone(employer.getPhone())
                .build();
    }

    public static EmployerResponseDto empty() {
        return new EmployerResponseDto();
    }
}
