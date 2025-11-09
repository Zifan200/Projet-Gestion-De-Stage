package org.example.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.*;
import org.example.model.enums.ApprovalStatus;

@Entity
@NoArgsConstructor
@Getter
@Setter
@ToString
public class InternshipOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String title;
    private String description;
    private String targetedProgramme;

    @ManyToOne
    @JoinColumn(name = "employer_id", referencedColumnName = "id")
    private Employer employer;

    private LocalDate publishedDate;
    private LocalDate expirationDate;

    @OneToMany(
        mappedBy = "offer",
        cascade = jakarta.persistence.CascadeType.ALL
    )
    private List<InternshipApplication> applications = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    private String reason;
    private LocalDate startDate;
    private LocalDate endDate;
    private String session;

    @Column(nullable = false)
    private boolean visibleToStudents = false;

    @Builder
    public InternshipOffer(
        Long id,
        String title,
        String description,
        String targetedProgramme,
        Employer employer,
        LocalDate publishedDate,
        LocalDate expirationDate,
        ApprovalStatus status,
        String reason,
        LocalDate startDate,
        LocalDate endDate,
        String session,
        List<InternshipApplication> applications,
        boolean visibleToStudents
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.employer = employer;
        this.targetedProgramme = targetedProgramme;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.status = status != null ? status : ApprovalStatus.PENDING;
        this.reason = reason;
        this.startDate = startDate;
        this.endDate = endDate;
        this.session = session;
        this.applications = applications;
        this.visibleToStudents = visibleToStudents;
    }
}
