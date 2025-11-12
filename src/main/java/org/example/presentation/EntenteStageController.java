package org.example.presentation;

import lombok.RequiredArgsConstructor;
import org.example.service.EntenteStageService;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
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

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generateEntente(
            @RequestBody InternshipApplicationResponseDTO dto,
            @RequestParam Long gestionnaireId
    ) throws IOException {

        byte[] pdfBytes = ententeStageService.generateEntenteDeStage(dto, gestionnaireId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=entente_stage.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
