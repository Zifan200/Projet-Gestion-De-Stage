package org.example.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
    private String targeted_programme;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    private Employer employer;

    private LocalDateTime publishedDate;
    private LocalDateTime expirationDate;

    @Builder
    public InternshipOffer(
            Long id, String title, String description, String targeted_programme, LocalDateTime publishedDate, LocalDateTime expirationDate
    ){
        this.id = id;
        this.title = title;
        this.description = description;
        this.targeted_programme = targeted_programme;
        this.publishedDate = publishedDate;
        this.expirationDate = expirationDate;
    }
}
