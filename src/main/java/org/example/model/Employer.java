package org.example.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.model.auth.Credentials;
import org.example.model.auth.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("E")
@Getter
@NoArgsConstructor
public class Employer extends UserApp {
    private LocalDate since;
    private String enterpriseName;
    private String phone;
    @Builder
    public Employer(
            Long id, String firstName, String lastName, String email, String password,
            boolean active, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime lastLoginAt,
            LocalDate since, String enterpriseName, String phone) {
        super(id, firstName, lastName, Credentials.builder()
                .email(email)
                .password(password)
                .role(Role.EMPLOYER)
                .build(), active, createdAt, updatedAt, lastLoginAt);
        this.since = since;
        this.enterpriseName = enterpriseName;
        this.phone = phone;
    }
}
