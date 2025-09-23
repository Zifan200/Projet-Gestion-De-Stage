package org.example.presentation;


import io.jsonwebtoken.Jwt;
import lombok.RequiredArgsConstructor;
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

      @PostMapping("/me/cv")
    public ResponseEntity<String> uploadMyCv(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body("");
    }
}
