package org.example.model;

import jakarta.persistence.OneToMany;
import org.example.model.CV;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;
import org.example.model.auth.Credentials;
import org.example.model.auth.Role;
import org.springframework.cglib.core.Local;
import org.springframework.security.core.userdetails.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Etudiant extends UserApp {
    private LocalDate since;
    private String phone;
    private String adresse;
    private String program;
    @OneToMany(mappedBy = "etudiant", cascade = jakarta.persistence.CascadeType.ALL)
    private List<CV> cv = new ArrayList<>();

    @OneToMany(mappedBy = "student")
    private Set<InternshipApplication> applications = new HashSet<>();

    @Builder
    public Etudiant(Long id, String firstName, String lastName, String email, String password, boolean active
    , String phone, String adresse, String program, LocalDate since,
                    LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime lastLoginAt) {
        super(id, firstName, lastName, Credentials.builder()
                .email(email)
                .password(password)
                .role(Role.STUDENT)
                .build(), active, createdAt, updatedAt, lastLoginAt);
        this.since = since;
        this.phone = phone;
        this.adresse = adresse;
        this.program = program;
    }
}
