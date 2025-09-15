package org.example.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.service.UserService;
import org.example.service.dto.EtudiantDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/etudiants")
@RequiredArgsConstructor
public class EtudiantController {

    private final UserService userService;

    @PostMapping("/inscription")
    public ResponseEntity<EtudiantDTO> inscription(@Valid @RequestBody EtudiantDTO etudiantDTO) {
        EtudiantDTO savedEtudiant = userService.inscriptionEtudiant(etudiantDTO);
        return ResponseEntity.ok(savedEtudiant);
    }
}
