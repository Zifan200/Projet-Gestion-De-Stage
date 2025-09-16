package org.example.service.dto;

import lombok.Builder;
import lombok.Data;
import org.example.model.Employer;

import java.time.LocalDate;



@Data
public class EmployerResponseDto {
    private LocalDate since;

    @Builder
    public EmployerResponseDto(String firstName, String lastName, String email, LocalDate since) {
        this.since = since;
    }

    public EmployerResponseDto() {}

    public static EmployerResponseDto create(Employer employer) {
        return EmployerResponseDto.builder()
                .firstName(employer.getFirstName())
                .lastName(employer.getLastName())
                .email(employer.getEmail())
                .since(employer.getSince())
                .build();
    }

    public static EmployerResponseDto empty() {
        return new EmployerResponseDto();
    }
}
