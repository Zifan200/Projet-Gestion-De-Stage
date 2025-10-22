package org.example.presentation;

import lombok.RequiredArgsConstructor;
import org.example.service.CVService;
import org.example.service.dto.cv.CvDownloadDTO;
import org.example.service.dto.cv.CvResponseDTO;
import org.example.service.dto.cv.CvStatusDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gs")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class GestionnaireController {

    private final CVService cvService;

    @GetMapping("/list")
    public ResponseEntity<List<CvResponseDTO>> listAllCvs() {
        return ResponseEntity.ok(cvService.listAllCvs());
    }

    @PutMapping("/{cvId}/status")
    public ResponseEntity<CvResponseDTO> updateCvStatus(
            @PathVariable Long cvId,
            @RequestBody CvStatusDTO request) {

        CvResponseDTO response = cvService.updateCvStatus(cvId, request.getStatus(), request.getReason());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{cvId}/approve")
    public ResponseEntity<CvResponseDTO> approveCv(@PathVariable Long cvId) {
        CvResponseDTO response = cvService.approveCv(cvId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{cvId}/reject")
    public ResponseEntity<CvResponseDTO> rejectCv(@PathVariable Long cvId, @RequestBody CvStatusDTO request) {
        CvResponseDTO response = cvService.refuseCv(cvId, request.getReason());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{cvId}/download")
    public ResponseEntity<byte[]> downloadCv(@PathVariable Long cvId) {
        CvDownloadDTO dto = cvService.downloadCvById(cvId);

        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"" + dto.getFileName() + "\"")
                .header("Content-Type", dto.getFileType())
                .body(dto.getData());
    }
}
