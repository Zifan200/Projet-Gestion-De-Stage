package org.example.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import org.example.model.auth.Credentials;
import org.example.model.auth.Role;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Teacher extends UserApp {

    private LocalDate since;
    private String phone;
    private String department;
    private String specialization;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
    private List<Etudiant> students = new ArrayList<>();

    @Builder
    public Teacher(
        Long id,
        String firstName,
        String lastName,
        String email,
        String password,
        boolean active,
        LocalDate since,
        String phone,
        String department,
        String specialization,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime lastLoginAt
    ) {
        super(
            id,
            firstName,
            lastName,
            Credentials.builder()
                .email(email)
                .password(password)
                .role(Role.TEACHER)
                .build(),
            active,
            createdAt,
            updatedAt,
            lastLoginAt
        );
        this.since = since;
        this.phone = phone;
        this.department = department;
        this.specialization = specialization;
    }
}
