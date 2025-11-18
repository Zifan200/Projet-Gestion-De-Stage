package org.example.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.example.model.Etudiant;
import org.example.model.Gestionnaire;
import org.example.model.InternshipOffer;
import org.example.model.InternshipRecommendation;
import org.example.model.enums.PriorityCode;
import org.example.repository.EtudiantRepository;
import org.example.repository.GestionnaireRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.repository.InternshipRecommendationRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.recommendation.RecommendationRequestDTO;
import org.example.service.dto.recommendation.RecommendationResponseDTO;
import org.example.service.exception.MaxGoldRecommendationsException;
import org.example.service.exception.RecommendationNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@AllArgsConstructor
@Service
public class InternshipRecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(
        InternshipRecommendationService.class
    );

    private final InternshipRecommendationRepository recommendationRepository;
    private final EtudiantRepository etudiantRepository;
    private final InternshipOfferRepository offerRepository;
    private final GestionnaireRepository gestionnaireRepository;

    @Transactional
    public RecommendationResponseDTO createOrUpdateRecommendation(
        RecommendationRequestDTO requestDTO,
        String gestionnaireEmail
    ) {
        Etudiant student = etudiantRepository
            .findById(requestDTO.getStudentId())
            .orElseThrow(() ->
                new UserNotFoundException("Étudiant introuvable")
            );

        InternshipOffer offer = offerRepository
            .findById(requestDTO.getOfferId())
            .orElseThrow(() ->
                new RecommendationNotFoundException(
                    "Offre de stage introuvable"
                )
            );

        Gestionnaire gestionnaire = gestionnaireRepository
            .findByCredentialsEmail(gestionnaireEmail)
            .orElseThrow(() ->
                new UserNotFoundException("Gestionnaire introuvable")
            );

        if (requestDTO.getPriorityCode() == PriorityCode.GOLD) {
            Long goldCount =
                recommendationRepository.countByStudentIdAndPriorityCode(
                    requestDTO.getStudentId(),
                    PriorityCode.GOLD
                );

            Optional<InternshipRecommendation> existing =
                recommendationRepository.findByStudentIdAndOfferId(
                    requestDTO.getStudentId(),
                    requestDTO.getOfferId()
                );

            if (existing.isEmpty() && goldCount >= 3) {
                throw new MaxGoldRecommendationsException(
                    "Maximum de 3 recommandations OR atteint pour cet étudiant"
                );
            }
        }

        Optional<InternshipRecommendation> existingRecommendation =
            recommendationRepository.findByStudentIdAndOfferId(
                requestDTO.getStudentId(),
                requestDTO.getOfferId()
            );

        InternshipRecommendation recommendation;

        if (existingRecommendation.isPresent()) {
            recommendation = existingRecommendation.get();
            recommendation.setPriorityCode(requestDTO.getPriorityCode());
            recommendation.setGestionnaire(gestionnaire);
            recommendation.setUpdatedAt(LocalDateTime.now());
            logger.info(
                "Updated recommendation for student {} and offer {}",
                requestDTO.getStudentId(),
                requestDTO.getOfferId()
            );
        } else {
            recommendation = InternshipRecommendation.builder()
                .student(student)
                .offer(offer)
                .gestionnaire(gestionnaire)
                .priorityCode(requestDTO.getPriorityCode())
                .build();
            logger.info(
                "Created new recommendation for student {} and offer {}",
                requestDTO.getStudentId(),
                requestDTO.getOfferId()
            );
        }

        InternshipRecommendation saved = recommendationRepository.save(
            recommendation
        );
        return RecommendationResponseDTO.create(saved);
    }

    public List<RecommendationResponseDTO> getRecommendationsForStudent(
        Long studentId
    ) {
        List<InternshipRecommendation> recommendations =
            recommendationRepository.findAllByStudentIdOrderedByPriority(
                studentId
            );
        return recommendations
            .stream()
            .map(RecommendationResponseDTO::create)
            .collect(Collectors.toList());
    }

    public List<RecommendationResponseDTO> getRecommendationsForOffer(
        Long offerId
    ) {
        List<InternshipRecommendation> recommendations =
            recommendationRepository.findAllByOfferId(offerId);
        return recommendations
            .stream()
            .map(RecommendationResponseDTO::create)
            .collect(Collectors.toList());
    }

    public List<RecommendationResponseDTO> getRecommendationsByGestionnaire(
        Long gestionnaireId
    ) {
        List<InternshipRecommendation> recommendations =
            recommendationRepository.findAllByGestionnaireId(gestionnaireId);
        return recommendations
            .stream()
            .map(RecommendationResponseDTO::create)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deleteRecommendation(Long recommendationId) {
        InternshipRecommendation recommendation = recommendationRepository
            .findById(recommendationId)
            .orElseThrow(() ->
                new RecommendationNotFoundException(
                    "Recommandation introuvable"
                )
            );

        recommendationRepository.delete(recommendation);
        logger.info("Deleted recommendation with id {}", recommendationId);
    }

    @Transactional
    public void deleteRecommendationByStudentAndOffer(
        Long studentId,
        Long offerId
    ) {
        InternshipRecommendation recommendation = recommendationRepository
            .findByStudentIdAndOfferId(studentId, offerId)
            .orElseThrow(() ->
                new RecommendationNotFoundException(
                    "Recommandation introuvable pour cet étudiant et cette offre"
                )
            );

        recommendationRepository.delete(recommendation);
        logger.info(
            "Deleted recommendation for student {} and offer {}",
            studentId,
            offerId
        );
    }

    public List<RecommendationResponseDTO> getAllRecommendations() {
        return recommendationRepository
            .findAll()
            .stream()
            .map(RecommendationResponseDTO::create)
            .collect(Collectors.toList());
    }

    public RecommendationResponseDTO getRecommendationById(Long id) {
        InternshipRecommendation recommendation = recommendationRepository
            .findById(id)
            .orElseThrow(() ->
                new RecommendationNotFoundException(
                    "Recommandation introuvable"
                )
            );
        return RecommendationResponseDTO.create(recommendation);
    }
}
