package org.example.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.*;
import org.example.model.enums.ApprovalStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "convocation")
public class Convocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch =  FetchType.LAZY, optional = false)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employer_id", nullable = false, referencedColumnName = "id")
    private Employer employer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status =  ApprovalStatus.PENDING;

    private LocalDateTime dateConvocation;

    @Nullable
    private String location;

    @Nullable
    private String link;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private InternshipApplication internshipApplication;

}
