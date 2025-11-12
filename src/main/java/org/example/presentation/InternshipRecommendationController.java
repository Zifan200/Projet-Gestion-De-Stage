package org.example.presentation;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.model.auth.Role;
import org.example.security.exception.UserNotFoundException;
import org.example.service.InternshipRecommendationService;
import org.example.service.UserAppService;
import org.example.service.dto.recommendation.RecommendationRequestDTO;
import org.example.service.dto.recommendation.RecommendationResponseDTO;
import org.example.service.dto.util.UserDTO;
import org.example.service.exception.MaxGoldRecommendationsException;
import org.example.service.exception.RecommendationNotFoundException;
import org.example.utils.JwtTokenUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class InternshipRecommendationController {

    private final InternshipRecommendationService recommendationService;
    private final UserAppService userAppService;

    @PostMapping
    public ResponseEntity<
        RecommendationResponseDTO
    > createOrUpdateRecommendation(
        HttpServletRequest request,
        @Valid @RequestBody RecommendationRequestDTO requestDTO
    ) {
        UserDTO user = userAppService.getMe(
            JwtTokenUtils.getTokenFromRequest(request)
        );

        if (user.getRole() != Role.GESTIONNAIRE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        RecommendationResponseDTO response =
            recommendationService.createOrUpdateRecommendation(
                requestDTO,
                user.getEmail()
            );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<
        List<RecommendationResponseDTO>
    > getRecommendationsForStudent(@PathVariable Long studentId) {
        List<RecommendationResponseDTO> recommendations =
            recommendationService.getRecommendationsForStudent(studentId);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/offer/{offerId}")
    public ResponseEntity<
        List<RecommendationResponseDTO>
    > getRecommendationsForOffer(@PathVariable Long offerId) {
        List<RecommendationResponseDTO> recommendations =
            recommendationService.getRecommendationsForOffer(offerId);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/gestionnaire/{gestionnaireId}")
    public ResponseEntity<
        List<RecommendationResponseDTO>
    > getRecommendationsByGestionnaire(@PathVariable Long gestionnaireId) {
        List<RecommendationResponseDTO> recommendations =
            recommendationService.getRecommendationsByGestionnaire(
                gestionnaireId
            );
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping
    public ResponseEntity<
        List<RecommendationResponseDTO>
    > getAllRecommendations() {
        List<RecommendationResponseDTO> recommendations =
            recommendationService.getAllRecommendations();
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecommendationResponseDTO> getRecommendationById(
        @PathVariable Long id
    ) {
        RecommendationResponseDTO recommendation =
            recommendationService.getRecommendationById(id);
        return ResponseEntity.ok(recommendation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecommendation(@PathVariable Long id) {
        recommendationService.deleteRecommendation(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/student/{studentId}/offer/{offerId}")
    public ResponseEntity<Void> deleteRecommendationByStudentAndOffer(
        @PathVariable Long studentId,
        @PathVariable Long offerId
    ) {
        recommendationService.deleteRecommendationByStudentAndOffer(
            studentId,
            offerId
        );
        return ResponseEntity.noContent().build();
    }
}
