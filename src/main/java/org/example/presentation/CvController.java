package org.example.presentation;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.model.CV;
import org.example.service.CVService;
import org.example.service.UserAppService;
import org.example.service.dto.CvResponseDTO;
import org.example.service.dto.UserDTO;
import org.example.utils.JwtTokenUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/cv")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CvController {
    @Autowired
    private final CVService cvService;
    @Autowired
    private final UserAppService userAppService;

    @PostMapping("/me/cv")
    public ResponseEntity<CvResponseDTO> uploadMyCv(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file) {
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(cvService.addCv(email, file));
    }


    @GetMapping("/me")
    public ResponseEntity<List<CvResponseDTO>> listMyCvs(HttpServletRequest request) {
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        return ResponseEntity
                .ok(cvService.listMyCvs(email));

    }

    @GetMapping("/{cvId}/download")
    public ResponseEntity<byte[]> downloadCv(
            @PathVariable Long cvId,
            HttpServletRequest request) {

        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        CV cv = cvService.downloadCv(cvId, email);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(cv.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + cv.getFileName() + "\"")
                .body(cv.getData());
    }

    @DeleteMapping("/{cvId}")
    public ResponseEntity<Void> deleteCv(@PathVariable Long cvId,
                                         HttpServletRequest request) {
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        cvService.deleteCv(cvId, email);
        return ResponseEntity.noContent().build();
    }
}
