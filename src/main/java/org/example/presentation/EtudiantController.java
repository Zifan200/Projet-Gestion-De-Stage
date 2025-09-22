package org.example.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.service.UserService;
import org.example.service.EmailService;
import org.example.service.dto.EtudiantDTO;
import org.example.model.EmailMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/etudiants")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class EtudiantController {

    private final UserService userService;
    private final EmailService emailService;

    @PostMapping("/inscription")
    public ResponseEntity<EtudiantDTO> inscription(@Valid @RequestBody EtudiantDTO etudiantDTO) {
        System.out.println("=== Requête reçue dans le controller ===");
        System.out.println("Données reçues : " + etudiantDTO);

        // Sauvegarde de l'étudiant
        EtudiantDTO savedEtudiant = userService.inscriptionEtudiant(etudiantDTO);

        System.out.println("=== Après sauvegarde ===");
        System.out.println("Etudiant sauvegardé : " + savedEtudiant);

        EmailMessage emailEtudiant = new EmailMessage();
        emailEtudiant.setTo(savedEtudiant.getCourriel());
        System.out.println("Envoi de l'email à : " + savedEtudiant.getCourriel());
        emailEtudiant.setSubject("Confirmation d'inscription");
        emailEtudiant.setBody(
                "<p>Bonjour <strong>" + savedEtudiant.getNom() + " " + savedEtudiant.getPrenom() + "</strong>,</p>" +
                        "<p>Votre inscription au programme <strong>" + savedEtudiant.getProgramme() + "</strong> a été enregistrée avec succès.</p>"
        );
        System.out.println("Email à envoyer : " + emailEtudiant);
        emailService.sendEmail(emailEtudiant);

        EmailMessage emailAdmin = new EmailMessage();
        emailAdmin.setTo("tonemail@example.com");
        emailAdmin.setSubject("Nouvelle inscription Étudiant");
        emailAdmin.setBody(
                "<p>L'étudiant <strong>" + savedEtudiant.getNom() + " " + savedEtudiant.getPrenom() + "</strong> vient de s'inscrire.</p>" +
                        "<p>Email : " + savedEtudiant.getCourriel() + "<br/>Programme : " + savedEtudiant.getProgramme() + "</p>"
        );
        emailService.sendEmail(emailAdmin);

        return ResponseEntity.ok(savedEtudiant);
    }
}
