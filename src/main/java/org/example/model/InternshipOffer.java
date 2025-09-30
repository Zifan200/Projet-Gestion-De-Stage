package org.example.model;

import jakarta.persistence.*;
import lombok.*;

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
    @Column(name = "target_programme")
    private String targetedProgramme;

    @ManyToOne
    @JoinColumn(name = "employer_id", referencedColumnName = "id")
    private Employer employer;

    private LocalDate publishedDate =  LocalDate.now();
    private LocalDate expirationDate;


    @Builder
    public InternshipOffer(
            Long id, String title, String description, String targetedProgramme, Employer employer,
            LocalDate publishedDate, LocalDate expirationDate
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.employer = employer;
        this.targetedProgramme = targetedProgramme;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
    }
}
