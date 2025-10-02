package org.example.model;

import jakarta.persistence.Entity;
import lombok.*;
import org.example.model.auth.Credentials;
import org.example.model.auth.Role;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Gestionnaire extends UserApp {

    private String phone;

    @Builder
    public Gestionnaire(Long id, String lastName, String firstName, String email, String password, boolean active,
                        LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime lastLoginAt, String phone) {
        super(id, lastName, firstName, Credentials.builder()
                .email(email)
                .password(password)
                .role(Role.GESTIONNAIRE)
                .build(), active, createdAt, updatedAt, lastLoginAt);
        this.phone = phone;
    }
}
