package org.example.model;

import jakarta.persistence.*;
import lombok.*;
import org.example.model.enums.ApprovalStatus;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@Entity
public class InternshipApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Etudiant student;
    @ManyToOne
    private CV selectedStudentCV;
    @ManyToOne
    private InternshipOffer offer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status =  ApprovalStatus.PENDING;
    private LocalDateTime createdAt;

    @Builder
    public InternshipApplication(
            Long id, Etudiant student, InternshipOffer offer, CV selectedStudentCV, ApprovalStatus status
    ){
        this.id = id;
        this.student = student;
        this.offer = offer;
        this.selectedStudentCV = selectedStudentCV;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }
}



