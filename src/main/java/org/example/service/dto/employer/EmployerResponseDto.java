package org.example.service.dto.employer;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import org.example.model.Employer;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter
@Data
public class EmployerResponseDto {
    private String firstName;
    private String lastName;
    private String email;
    private LocalDate since;
    private String enterpriseName;
    private String phone;
    private boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;

    @Builder
    public EmployerResponseDto(String firstName, String lastName, String email,
                               LocalDate since, String enterpriseName, String phone,
                               boolean active, LocalDateTime createdAt,
                               LocalDateTime updatedAt, LocalDateTime lastLoginAt) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.since = since;
        this.enterpriseName = enterpriseName;
        this.phone = phone;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLoginAt = lastLoginAt;
    }

    public EmployerResponseDto() {}

    public static EmployerResponseDto create(Employer employer) {
        return EmployerResponseDto.builder()
                .firstName(employer.getFirstName())
                .lastName(employer.getLastName())
                .email(employer.getEmail())
                .since(employer.getSince())
                .active(employer.isActive())
                .createdAt(employer.getCreatedAt())
                .updatedAt(employer.getCreatedAt())
                .lastLoginAt(employer.getCreatedAt())
                .enterpriseName(employer.getEnterpriseName())
                .phone(employer.getPhone())
                .build();
    }

    public static EmployerResponseDto empty() {
        return new EmployerResponseDto();
    }
}
