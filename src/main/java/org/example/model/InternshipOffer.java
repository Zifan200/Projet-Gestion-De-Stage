package org.example.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.example.model.enums.ApprovalStatus;
import org.example.model.enums.TypeHoraire;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "offer", cascade = CascadeType.ALL)
    private List<InternshipApplication> applications = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    private String reason;
    private LocalDate startDate;
    private LocalDate endDate;
    private String session;
    private TypeHoraire typeHoraire = TypeHoraire.UNSELECTED;

    @Min(0)
    private float nbHeures;
    private String address;

    @Min(0)
    private float salary;

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
            TypeHoraire typeHoraire,
            List<InternshipApplication> applications,
            float nbHeures,
            String address,
            float salary
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.targetedProgramme = targetedProgramme;
        this.employer = employer;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
        this.status = status != null ? status : ApprovalStatus.PENDING;
        this.reason = reason;
        this.startDate = startDate;
        this.endDate = endDate;
        this.session = session;
        this.typeHoraire = typeHoraire != null ? typeHoraire : TypeHoraire.UNSELECTED;
        this.applications = applications != null ? applications : new ArrayList<>();
        this.nbHeures = nbHeures;
        this.address = address;
        this.salary = salary;
    }

}
