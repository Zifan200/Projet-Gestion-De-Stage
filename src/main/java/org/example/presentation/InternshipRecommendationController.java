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
    public ResponseEntity<?> createOrUpdateRecommendation(
        HttpServletRequest request,
        @Valid @RequestBody RecommendationRequestDTO requestDTO
    ) {
        try {
            UserDTO user = userAppService.getMe(
                JwtTokenUtils.getTokenFromRequest(request)
            );

            if (user.getRole() != Role.GESTIONNAIRE) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    "Seuls les gestionnaires peuvent créer des recommandations"
                );
            }

            RecommendationResponseDTO response =
                recommendationService.createOrUpdateRecommendation(
                    requestDTO,
                    user.getEmail()
                );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                e.getMessage()
            );
        } catch (MaxGoldRecommendationsException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                e.getMessage()
            );
        } catch (RecommendationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                e.getMessage()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                "Erreur lors de la création de la recommandation"
            );
        }
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
    public ResponseEntity<?> getRecommendationById(@PathVariable Long id) {
        try {
            RecommendationResponseDTO recommendation =
                recommendationService.getRecommendationById(id);
            return ResponseEntity.ok(recommendation);
        } catch (RecommendationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                e.getMessage()
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecommendation(@PathVariable Long id) {
        try {
            recommendationService.deleteRecommendation(id);
            return ResponseEntity.noContent().build();
        } catch (RecommendationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                e.getMessage()
            );
        }
    }

    @DeleteMapping("/student/{studentId}/offer/{offerId}")
    public ResponseEntity<?> deleteRecommendationByStudentAndOffer(
        @PathVariable Long studentId,
        @PathVariable Long offerId
    ) {
        try {
            recommendationService.deleteRecommendationByStudentAndOffer(
                studentId,
                offerId
            );
            return ResponseEntity.noContent().build();
        } catch (RecommendationNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                e.getMessage()
            );
        }
    }
}
