package org.example.model;

import jakarta.persistence.OneToMany;
import org.example.model.CV;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Etudiant {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String prenom;
    private String courriel;
    private String telephone;
    private String adresse;
    private String programme;
    private int age;
    private String  motDePasse;
    @OneToMany(mappedBy = "etudiant", cascade = jakarta.persistence.CascadeType.ALL)
    private List<CV> cv = new ArrayList<>();

}
