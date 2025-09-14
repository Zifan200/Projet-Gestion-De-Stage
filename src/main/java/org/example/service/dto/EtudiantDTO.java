package org.example.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class EtudiantDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String courriel;
    private String telephone;
    private String adresse;
    private String programme;
    private int age;

}

