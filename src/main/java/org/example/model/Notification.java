package org.example.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    private Etudiant etudiant;

    @ManyToOne
    private Employer employer;

    @ManyToOne
    private Gestionnaire gestionnaire;

    @ManyToOne
    private Teacher teacher;
}
