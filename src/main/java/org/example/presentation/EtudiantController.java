package org.example.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.service.UserService;
import org.example.service.dto.EtudiantDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/etudiants")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class EtudiantController {

    private final UserService userService;

    @PostMapping("/inscription")
    public ResponseEntity<EtudiantDTO> inscription(@Valid @RequestBody EtudiantDTO etudiantDTO) {
        System.out.println("=== Requête reçue dans le controller ===");
        System.out.println("Données reçues : " + etudiantDTO);

        EtudiantDTO savedEtudiant = userService.inscriptionEtudiant(etudiantDTO);

        System.out.println("=== Après sauvegarde ===");
        System.out.println("Etudiant sauvegardé : " + savedEtudiant);

        return ResponseEntity.ok(savedEtudiant);
    }

}
