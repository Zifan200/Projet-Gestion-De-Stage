package org.example.presentation;

import lombok.RequiredArgsConstructor;
import org.example.service.EntenteStageService;
import org.example.service.dto.entente.EntenteGenerationRequestDTO;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/entente")
@CrossOrigin(origins = "http://localhost:5173")
public class EntenteStageController {

    private final EntenteStageService ententeStageService;

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

    private ResponseEntity<byte[]> buildPdfResponse(byte[] pdfBytes) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=entente_stage.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}