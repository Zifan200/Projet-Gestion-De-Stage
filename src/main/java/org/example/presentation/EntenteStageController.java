package org.example.presentation;

import lombok.RequiredArgsConstructor;
import org.example.model.EntenteStagePdf;
import org.example.model.InternshipApplication;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.EntenteStagePdfRepository;
import org.example.repository.InternshipApplicationRepository;
import org.example.service.EntenteStageService;
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

    @PostMapping("create")
    public ResponseEntity<byte[]> createEntente(@RequestBody EntenteGenerationRequestDTO request) throws IOException {
        byte[] pdfBytes = ententeStageService.generateEntenteDeStage(
                request.getApplication(),
                request.getGestionnaireId(),
                request.getRole()
        );
        return buildPdfResponse(pdfBytes);
    }

    @PutMapping("/update")
    public ResponseEntity<byte[]> updateEntente(@RequestBody EntenteGenerationRequestDTO request) throws IOException {
        byte[] pdfBytes = ententeStageService.updateEntenteDeStage(
                request.getId(),
                request.getApplication(),
                request.getGestionnaireId(),
                request.getRole()
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
    public ResponseEntity<EntenteStagePdfDTO> getEntenteById(@PathVariable long id) {
        EntenteStagePdf pdfEntity = ententeStagePdfRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Entente non trouvée"));

        InternshipApplicationResponseDTO appDto = internshipApplicationRepository
                .findById(pdfEntity.getApplication().getId())
                .map(InternshipApplicationResponseDTO::create)
                .orElse(null);

        EntenteStagePdfDTO dto = new EntenteStagePdfDTO(
                pdfEntity.getId(),
                pdfEntity.getPdfData(),
                pdfEntity.getStatus(),
                appDto
        );

        return ResponseEntity.ok(dto);
    }
    private ResponseEntity<byte[]> buildPdfResponse(byte[] pdfBytes) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=entente_stage.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}