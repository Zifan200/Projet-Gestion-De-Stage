package org.example.model;


import jakarta.persistence.*;
import lombok.*;
import org.example.model.enums.ApprovalStatus;

import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
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

    @OneToMany(mappedBy = "offer")
    private Set<InternshipApplication> applications = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    private String reason;
    private Date dateDebut;
    private Date dateFin;

    @Builder
    public InternshipOffer(
            Long id, String title, String description, String targetedProgramme, Employer employer, LocalDate publishedDate, LocalDate expirationDate, ApprovalStatus status, String reason, Set<InternshipApplication> applications, Date dateDebut, Date dateFin
    ){
        this.id = id;
        this.title = title;
        this.description = description;
        this.employer = employer;
        this.targetedProgramme = targetedProgramme;
        this.applications = applications;

        this.publishedDate = publishedDate; // date when posted
        this.expirationDate = expirationDate; // optional expiration date for application to the offer
        this.status = status != null ? status : ApprovalStatus.PENDING;
        this.reason = reason;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
    }
}
