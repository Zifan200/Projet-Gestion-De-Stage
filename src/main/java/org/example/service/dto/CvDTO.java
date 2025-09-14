package org.example.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.model.Etudiant;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CvDTO {
    private Long id;
    private Etudiant etudiant;
}
