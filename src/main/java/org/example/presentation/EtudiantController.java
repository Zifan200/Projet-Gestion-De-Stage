package org.example.presentation;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.service.InternshipApplicationService;
import org.example.service.StudentService;
import org.example.service.EmailService;
import org.example.service.UserAppService;
import org.example.service.dto.EtudiantDTO;
import org.example.model.EmailMessage;
import org.example.service.dto.InternshipApplicaiton.InternshipApplicationDto;
import org.example.service.dto.InternshipApplicaiton.InternshipApplicationResponseDto;
import org.example.utils.JwtTokenUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/student")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class EtudiantController {

    private final UserAppService userAppService;
    private final StudentService studentService;
    private final EmailService emailService;
    private final InternshipApplicationService internshipApplicationService;

    @PostMapping("/register")
    public ResponseEntity<EtudiantDTO> inscription(@Valid @RequestBody EtudiantDTO etudiantDTO) {
        System.out.println("=== Requête reçue dans le controller ===");
        System.out.println("Données reçues : " + etudiantDTO);

        // Sauvegarde de l'étudiant
        EtudiantDTO savedEtudiant = studentService.inscriptionEtudiant(etudiantDTO);

        System.out.println("=== Après sauvegarde ===");
        System.out.println("Etudiant sauvegardé : " + savedEtudiant);

        EmailMessage emailEtudiant = new EmailMessage();
        emailEtudiant.setTo(savedEtudiant.getEmail());
        System.out.println("Envoi de l'email à : " + savedEtudiant.getEmail());
        emailEtudiant.setSubject("Confirmation d'inscription");
        emailEtudiant.setBody(
                "<p>Bonjour <strong>" + savedEtudiant.getLastName() + " " + savedEtudiant.getLastName() + "</strong>,</p>" +
                        "<p>Votre inscription au programme <strong>" + savedEtudiant.getProgram() + "</strong> a été enregistrée avec succès.</p>"
        );
        System.out.println("Email à envoyer : " + emailEtudiant);
        emailService.sendEmail(emailEtudiant);

        EmailMessage emailAdmin = new EmailMessage();
        emailAdmin.setTo("tonemail@example.com");
        emailAdmin.setSubject("Nouvelle inscription Étudiant");
        emailAdmin.setBody(
                "<p>L'étudiant <strong>" + savedEtudiant.getEmail() + " " + savedEtudiant.getEmail() + "</strong> vient de s'inscrire.</p>" +
                        "<p>Email : " + savedEtudiant.getEmail() + "<br/>Programme : " + savedEtudiant.getProgram() + "</p>"
        );
        emailService.sendEmail(emailAdmin);

        return ResponseEntity.ok(savedEtudiant);
    }

    @PostMapping("/apply-to-internship-offer")
    public ResponseEntity<InternshipApplicationResponseDto> applyToInternShipOffer(
            HttpServletRequest request,
            @Valid @RequestBody InternshipApplicationDto internshipApplicationDtoDto) {
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(internshipApplicationService.saveInternshipApplicaiton(email, internshipApplicationDtoDto));
    }
}
