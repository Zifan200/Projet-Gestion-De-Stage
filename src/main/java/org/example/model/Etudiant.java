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

    public Etudiant(String nom, String prenom, String courriel, String telephone, String adresse, String programme, int age, String motDePasse, CV cv) {
        this.nom = nom;
        this.prenom = prenom;
        this.courriel = courriel;
        this.telephone = telephone;
        this.adresse = adresse;
        this.programme = programme;
        this.age = age;
        this.motDePasse = motDePasse;
        this.cv.add(cv);
    }
}
