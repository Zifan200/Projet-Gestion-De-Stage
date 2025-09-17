package org.example.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
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
}
