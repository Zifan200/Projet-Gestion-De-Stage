package org.example.model;


import jakarta.persistence.*;
import lombok.*;
import org.example.model.enums.InternshipOfferStatus;

import java.time.LocalDate;
import java.time.LocalDate;

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InternshipOfferStatus status = InternshipOfferStatus.PENDING;

    @Builder
    public InternshipOffer(
            Long id, String title, String description, String targetedProgramme, Employer employer, LocalDate publishedDate, LocalDate expirationDate
    ){
        this.id = id;
        this.title = title;
        this.description = description;
        this.employer = employer;
        this.targetedProgramme = targetedProgramme;

        this.publishedDate = publishedDate; // date when posted
        this.expirationDate = expirationDate; // optional expiration date for application to the offer
    }
}
