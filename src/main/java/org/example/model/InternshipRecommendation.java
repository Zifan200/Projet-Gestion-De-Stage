package org.example.model;

import jakarta.persistence.*;
import lombok.*;
import org.example.model.enums.PriorityCode;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "offer_id"})
})
public class InternshipRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Etudiant student;

    @ManyToOne
    @JoinColumn(name = "offer_id", nullable = false)
    private InternshipOffer offer;

    @ManyToOne
    @JoinColumn(name = "gestionnaire_id", nullable = false)
    private Gestionnaire gestionnaire;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriorityCode priorityCode;

    private LocalDateTime recommendedAt;

    private LocalDateTime updatedAt;

    @Builder
    public InternshipRecommendation(
            Long id,
            Etudiant student,
            InternshipOffer offer,
            Gestionnaire gestionnaire,
            PriorityCode priorityCode
    ) {
        this.id = id;
        this.student = student;
        this.offer = offer;
        this.gestionnaire = gestionnaire;
        this.priorityCode = priorityCode;
        this.recommendedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
