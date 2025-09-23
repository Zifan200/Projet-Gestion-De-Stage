package org.example.presentation;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.service.CVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/etudiants/cv")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CvController {
    @Autowired
    private final CVService cvService;

      @PostMapping("/me/cv")
    public ResponseEntity<String> uploadMyCv(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file) {
          String authHeader = request.getHeader("Authorization");
          if (authHeader == null || !authHeader.startsWith("Bearer ")) {
              throw new RuntimeException("JWT manquant ou invalide");
          }
          String token = authHeader.substring(7);
          cvService.addCv(token, file);
        return ResponseEntity.status(HttpStatus.CREATED).body("");
    }
}
