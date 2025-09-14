package org.example.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Etudiant {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Integer etudiant_Id;
    private String nom;
    private String prenom;
    private String courriel;
    private String telephone;
    private String adresse;
    private String programme;
    private int age;
    private String  motDePasse;

public Etudiant(String nom, String prenom, String courriel, String telephone, String adresse, String programme, int age, String motDePasse) {
        this.nom = nom;
        this.prenom = prenom;
        this.courriel = courriel;
        this.telephone = telephone;
        this.adresse = adresse;
        this.programme = programme;
        this.age = age;
        this.motDePasse = motDePasse;
    }

    public Integer getEtudiant_Id() {
        return etudiant_Id;
    }

    public String getNom() {
        return nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public String getCourriel() {
        return courriel;
    }

    public String getTelephone() {
        return telephone;
    }

    public String getAdresse() {
        return adresse;
    }

    public String getProgramme() {
        return programme;
    }

    public int getAge() {
        return age;
    }

    public String getMotDePasse() {
        return motDePasse;
    }

    public void setEtudiant_Id(Integer etudiant_Id) {
        this.etudiant_Id = etudiant_Id;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public void setCourriel(String courriel) {
        this.courriel = courriel;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public void setProgramme(String programme) {
        this.programme = programme;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public void setMotDePasse(String motDePasse) {
        this.motDePasse = motDePasse;
    }
}
