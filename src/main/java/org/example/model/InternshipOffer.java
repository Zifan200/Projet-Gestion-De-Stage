package org.example.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.example.model.enums.ApprovalStatus;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

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

    @OneToMany(mappedBy = "offer", cascade = jakarta.persistence.CascadeType.ALL)
    private List<InternshipApplication> applications  = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    private String reason;
    private LocalDate startDate;
    private LocalDate endDate;
    private String session;

    @Min(0)
    private float salary;

    @Builder
    public InternshipOffer(
            Long id, String title, String description, String targetedProgramme, Employer employer,
            LocalDate publishedDate, LocalDate expirationDate, ApprovalStatus status, String reason,
            LocalDate startDate, LocalDate endDate, String session, List<InternshipApplication> applications,
            float salary
    ){
        this.id = id;
        this.title = title;
        this.description = description;
        this.employer = employer;
        this.targetedProgramme = targetedProgramme;
        this.publishedDate = publishedDate; // date when posted
        this.expirationDate = expirationDate; // optional expiration date for application to the offer
        this.status = status != null ? status : ApprovalStatus.PENDING;
        this.reason = reason;
        this.startDate = startDate;
        this.endDate = endDate;
        this.session = session;
        this.applications = applications;
        this.salary = salary;
    }
}
