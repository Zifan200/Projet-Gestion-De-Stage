package org.example.presentation;

import lombok.RequiredArgsConstructor;
import org.example.model.EntenteStagePdf;
import org.example.model.InternshipApplication;
import org.example.model.auth.Role;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.EntenteStagePdfRepository;
import org.example.repository.InternshipApplicationRepository;
import org.example.service.EntenteStageService;
import org.example.service.dto.entente.EntenteCreationResponseDTO;
import org.example.service.dto.entente.EntenteGenerationRequestDTO;
import org.example.service.dto.entente.EntenteStagePdfDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/entente")
@CrossOrigin(origins = "http://localhost:5173")
public class EntenteStageController {

    private final EntenteStageService ententeStageService;
    private final InternshipApplicationRepository internshipApplicationRepository;
    private final EntenteStagePdfRepository ententeStagePdfRepository;

    @PostMapping("/create")
    public ResponseEntity<EntenteCreationResponseDTO> createEntente(@RequestBody EntenteGenerationRequestDTO request) throws IOException {

        // Génère le PDF
        byte[] pdfBytes = ententeStageService.generateEntenteDeStage(
                request.getApplication(),
                request.getGestionnaireId(),
                request.getRole()
        );

        // Le service a déjà sauvegardé le PDF et mis à jour l'application avec l'ID
        InternshipApplication app = internshipApplicationRepository.findById(request.getApplication().getId())
                .orElseThrow(() -> new IllegalStateException("Application not found"));

        Long ententeId = app.getEntenteStagePdfId();

        EntenteCreationResponseDTO response = new EntenteCreationResponseDTO(ententeId, pdfBytes);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<byte[]> previewEntente(@PathVariable Long id) {
        System.out.println("🔹 previewEntente called for ID: " + id);

        EntenteStagePdf pdfEntity = ententeStagePdfRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Entente non trouvée"));

        System.out.println("PDF data length: " + (pdfEntity.getPdfData() != null ? pdfEntity.getPdfData().length : "null"));

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfEntity.getPdfData());
    }



    @PutMapping("/update")
    public ResponseEntity<byte[]> updateEntente(@RequestBody EntenteGenerationRequestDTO request) throws IOException {

        // Déterminer la signature à utiliser selon le rôle
        String signature;
        switch (request.getRole()) {
            case GESTIONNAIRE -> signature = request.getSignatureGestionnaire();
            case EMPLOYER -> signature = request.getSignatureEmployer();
            case STUDENT -> signature = request.getSignatureEtudiant();
            default -> throw new IllegalArgumentException("Rôle inconnu : " + request.getRole());
        }

        // Déterminer l'ID de la personne qui signe
        Long signerId;
        switch (request.getRole()) {
            case GESTIONNAIRE -> signerId = request.getGestionnaireId();
            case EMPLOYER -> signerId = request.getEmployerId();
            case STUDENT -> signerId = request.getEtudiantId();
            default -> throw new IllegalArgumentException("Rôle inconnu : " + request.getRole());
        }

        byte[] pdfBytes = ententeStageService.updateEntenteDeStage(
                request.getId(),
                request.getApplication(),
                signerId,
                request.getRole(),
                signature
        );

        return buildPdfResponse(pdfBytes);
    }

    // Liste seulement les applications qui sont en mesure de générer une entente.
    @GetMapping("/all-available")
    public List<InternshipApplicationResponseDTO> getAvailableApplications() {
        List<InternshipApplication> apps = internshipApplicationRepository
                .findAllByPostInterviewStatusAndEtudiantStatusAndClaimedIsFalse(
                        ApprovalStatus.ACCEPTED,
                        ApprovalStatus.CONFIRMED_BY_STUDENT
                );

        return apps.stream()
                .map(InternshipApplicationResponseDTO::create)
                .collect(Collectors.toList());
    }

    // Seulement après qu'une entente a été générée.
    @GetMapping("/{id}")
    public ResponseEntity<EntenteStagePdfDTO> getEntenteById(@PathVariable Long id) {
        EntenteStagePdf pdfEntity = ententeStagePdfRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Entente non trouvée"));

        InternshipApplicationResponseDTO appDto = internshipApplicationRepository
                .findById(pdfEntity.getApplicationId())
                .map(InternshipApplicationResponseDTO::create)
                .orElse(null);

        EntenteStagePdfDTO dto = new EntenteStagePdfDTO(
                pdfEntity.getId(),
                pdfEntity.getPdfData(),
                pdfEntity.getStatus(),
                appDto.getId()
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadEntente(@PathVariable Long id) {
        EntenteStagePdf pdfEntity = ententeStagePdfRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Entente non trouvée"));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=entente_stage.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfEntity.getPdfData());
        //return buildPdfResponse(pdfEntity.getPdfData());
    }

    private ResponseEntity<byte[]> buildPdfResponse(byte[] pdfBytes) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=entente_stage.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}