package org.example.presentation;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.service.InternshipApplicationService;
import org.example.service.StudentService;
import org.example.service.EmailService;
import org.example.service.UserAppService;
import org.example.service.dto.student.EtudiantDTO;
import org.example.model.EmailMessage;
import org.example.service.dto.internshipApplication.InternshipApplicationDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.dto.student.EtudiantDecisionDTO;
import org.example.utils.JwtTokenUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<InternshipApplicationResponseDTO> applyToInternShipOffer(
            HttpServletRequest request,
            @Valid @RequestBody InternshipApplicationDTO internshipApplicationDtoDTO) {
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        internshipApplicationDtoDTO.setStudentEmail(email);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(internshipApplicationService.saveInternshipApplication(internshipApplicationDtoDTO));
    }

    @GetMapping("/get-internship-application/{id}")
    public ResponseEntity<InternshipApplicationResponseDTO> getInternshipApplicationForStudentById(
            HttpServletRequest request,
            @PathVariable Long id
    ) {
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        return ResponseEntity.ok(internshipApplicationService.getApplicationByStudentAndId(email, id));
    }

    @GetMapping("/get-all-internship-applications")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplicationsForStudent(
            HttpServletRequest request
    ){
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        return ResponseEntity.ok(internshipApplicationService.getAllApplicationsFromStudent(email));
    }

    @GetMapping("/get-internship-applications/{status}")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplicationsForStudentByStatus(
            HttpServletRequest request,
            @PathVariable String status
    ){
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        return ResponseEntity.ok(
                internshipApplicationService.getAllApplicationsFromStudentByStatus(email, status)
        );
    }

    @PostMapping("/student/{applicationId}/accept")
    public ResponseEntity<InternshipApplicationResponseDTO> acceptOfferByStudent(
            @PathVariable Long applicationId,
            @RequestBody EtudiantDecisionDTO request
    ) {
        InternshipApplicationResponseDTO response =
                internshipApplicationService.acceptOfferByStudent(request.getStudentEmail(), applicationId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/student/{applicationId}/reject")
    public ResponseEntity<InternshipApplicationResponseDTO> rejectOfferByStudent(
            @PathVariable Long applicationId,
            @RequestBody EtudiantDecisionDTO request
    ) {
        InternshipApplicationResponseDTO response =
                internshipApplicationService.rejectOfferByStudent(request.getStudentEmail(), applicationId,
                        request.getEtudiantRaison());
        return ResponseEntity.ok(response);
    }
}