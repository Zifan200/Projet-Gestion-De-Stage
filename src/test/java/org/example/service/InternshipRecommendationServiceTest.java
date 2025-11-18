package org.example.service;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class InternshipRecommendationServiceTest {

    @Mock
    private InternshipRecommendationRepository recommendationRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private InternshipOfferRepository offerRepository;

    @Mock
    private GestionnaireRepository gestionnaireRepository;

    @InjectMocks
    private InternshipRecommendationService service;

    private Etudiant buildEtudiant() {
        return Etudiant.builder()
            .id(1L)
            .firstName("John")
            .lastName("Doe")
            .email("john.doe@example.com")
            .build();
    }

    private InternshipOffer buildInternshipOffer() {
        return InternshipOffer.builder()
            .id(1L)
            .title("Développeur Java")
            .description("Stage backend")
            .build();
    }

    private Gestionnaire buildGestionnaire() {
        return Gestionnaire.builder()
            .id(1L)
            .firstName("François")
            .lastName("Lacoursière")
            .email("francois@test.com")
            .build();
    }

    private InternshipRecommendation buildRecommendation(
        Etudiant student,
        InternshipOffer offer,
        Gestionnaire gestionnaire,
        PriorityCode priorityCode
    ) {
        return InternshipRecommendation.builder()
            .id(1L)
            .student(student)
            .offer(offer)
            .gestionnaire(gestionnaire)
            .priorityCode(priorityCode)
            .build();
    }

    @Test
    void createRecommendation_shouldCreateSuccessfully() {
        // Arrange
        Etudiant student = buildEtudiant();
        InternshipOffer offer = buildInternshipOffer();
        Gestionnaire gestionnaire = buildGestionnaire();

        RecommendationRequestDTO requestDTO = RecommendationRequestDTO.builder()
            .studentId(1L)
            .offerId(1L)
            .priorityCode(PriorityCode.BLUE)
            .build();

        InternshipRecommendation savedRecommendation = buildRecommendation(
            student,
            offer,
            gestionnaire,
            PriorityCode.BLUE
        );

        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(student));
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(
            gestionnaireRepository.findByCredentialsEmail("francois@test.com")
        ).thenReturn(Optional.of(gestionnaire));
        when(
            recommendationRepository.findByStudentIdAndOfferId(1L, 1L)
        ).thenReturn(Optional.empty());
        when(
            recommendationRepository.save(any(InternshipRecommendation.class))
        ).thenReturn(savedRecommendation);

        // Act
        RecommendationResponseDTO result = service.createOrUpdateRecommendation(
            requestDTO,
            "francois@test.com"
        );

        // Assert
        assertNotNull(result);
        assertThat(result.getPriorityCode()).isEqualTo(PriorityCode.BLUE);
        assertThat(result.getStudentId()).isEqualTo(1L);
        assertThat(result.getOfferId()).isEqualTo(1L);
        verify(recommendationRepository).save(
            any(InternshipRecommendation.class)
        );
    }

    @Test
    void createRecommendation_shouldThrowException_whenStudentNotFound() {
        // Arrange
        RecommendationRequestDTO requestDTO = RecommendationRequestDTO.builder()
            .studentId(999L)
            .offerId(1L)
            .priorityCode(PriorityCode.GREEN)
            .build();

        when(etudiantRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() ->
            service.createOrUpdateRecommendation(
                requestDTO,
                "francois@test.com"
            )
        )
            .isInstanceOf(UserNotFoundException.class)
            .hasMessageContaining("userNotFound");
    }

    @Test
    void createRecommendation_shouldThrowException_whenOfferNotFound() {
        // Arrange
        Etudiant student = buildEtudiant();

        RecommendationRequestDTO requestDTO = RecommendationRequestDTO.builder()
            .studentId(1L)
            .offerId(999L)
            .priorityCode(PriorityCode.GREEN)
            .build();

        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(student));
        when(offerRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() ->
            service.createOrUpdateRecommendation(
                requestDTO,
                "francois@test.com"
            )
        )
            .isInstanceOf(RecommendationNotFoundException.class)
            .hasMessageContaining("Offre de stage introuvable");
    }

    @Test
    void createRecommendation_shouldThrowException_whenGestionnaireNotFound() {
        // Arrange
        Etudiant student = buildEtudiant();
        InternshipOffer offer = buildInternshipOffer();

        RecommendationRequestDTO requestDTO = RecommendationRequestDTO.builder()
            .studentId(1L)
            .offerId(1L)
            .priorityCode(PriorityCode.GREEN)
            .build();

        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(student));
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(
            gestionnaireRepository.findByCredentialsEmail("notfound@test.com")
        ).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() ->
            service.createOrUpdateRecommendation(
                requestDTO,
                "notfound@test.com"
            )
        )
            .isInstanceOf(UserNotFoundException.class)
            .hasMessageContaining("userNotFound");
    }

    @Test
    void createRecommendation_shouldThrowException_whenMaxGoldReached() {
        // Arrange
        Etudiant student = buildEtudiant();
        InternshipOffer offer = buildInternshipOffer();
        Gestionnaire gestionnaire = buildGestionnaire();

        RecommendationRequestDTO requestDTO = RecommendationRequestDTO.builder()
            .studentId(1L)
            .offerId(1L)
            .priorityCode(PriorityCode.GOLD)
            .build();

        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(student));
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(
            gestionnaireRepository.findByCredentialsEmail("francois@test.com")
        ).thenReturn(Optional.of(gestionnaire));
        when(
            recommendationRepository.countByStudentIdAndPriorityCode(
                1L,
                PriorityCode.GOLD
            )
        ).thenReturn(3L);
        when(
            recommendationRepository.findByStudentIdAndOfferId(1L, 1L)
        ).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() ->
            service.createOrUpdateRecommendation(
                requestDTO,
                "francois@test.com"
            )
        )
            .isInstanceOf(MaxGoldRecommendationsException.class)
            .hasMessageContaining("Maximum de 3 recommandations OR");
    }

    @Test
    void updateRecommendation_shouldUpdateExistingRecommendation() {
        // Arrange
        Etudiant student = buildEtudiant();
        InternshipOffer offer = buildInternshipOffer();
        Gestionnaire gestionnaire = buildGestionnaire();

        RecommendationRequestDTO requestDTO = RecommendationRequestDTO.builder()
            .studentId(1L)
            .offerId(1L)
            .priorityCode(PriorityCode.GOLD)
            .build();

        InternshipRecommendation existingRecommendation = buildRecommendation(
            student,
            offer,
            gestionnaire,
            PriorityCode.BLUE
        );

        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(student));
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(
            gestionnaireRepository.findByCredentialsEmail("francois@test.com")
        ).thenReturn(Optional.of(gestionnaire));
        when(
            recommendationRepository.findByStudentIdAndOfferId(1L, 1L)
        ).thenReturn(Optional.of(existingRecommendation));
        when(
            recommendationRepository.save(any(InternshipRecommendation.class))
        ).thenReturn(existingRecommendation);

        // Act
        RecommendationResponseDTO result = service.createOrUpdateRecommendation(
            requestDTO,
            "francois@test.com"
        );

        // Assert
        assertNotNull(result);
        verify(recommendationRepository).save(existingRecommendation);
        assertEquals(
            PriorityCode.GOLD,
            existingRecommendation.getPriorityCode()
        );
    }

    @Test
    void getRecommendationsForStudent_shouldReturnOrderedList() {
        // Arrange
        Etudiant student = buildEtudiant();
        InternshipOffer offer = buildInternshipOffer();
        Gestionnaire gestionnaire = buildGestionnaire();

        InternshipRecommendation rec1 = buildRecommendation(
            student,
            offer,
            gestionnaire,
            PriorityCode.GOLD
        );
        InternshipRecommendation rec2 = buildRecommendation(
            student,
            offer,
            gestionnaire,
            PriorityCode.BLUE
        );

        when(
            recommendationRepository.findAllByStudentIdOrderedByPriority(1L)
        ).thenReturn(Arrays.asList(rec1, rec2));

        // Act
        List<RecommendationResponseDTO> result =
            service.getRecommendationsForStudent(1L);

        // Assert
        assertNotNull(result);
        assertThat(result.size()).isEqualTo(2);
        verify(recommendationRepository).findAllByStudentIdOrderedByPriority(
            1L
        );
    }

    @Test
    void deleteRecommendation_shouldDeleteSuccessfully() {
        // Arrange
        Etudiant student = buildEtudiant();
        InternshipOffer offer = buildInternshipOffer();
        Gestionnaire gestionnaire = buildGestionnaire();
        InternshipRecommendation recommendation = buildRecommendation(
            student,
            offer,
            gestionnaire,
            PriorityCode.GREEN
        );

        when(recommendationRepository.findById(1L)).thenReturn(
            Optional.of(recommendation)
        );

        // Act
        service.deleteRecommendation(1L);

        // Assert
        verify(recommendationRepository).delete(recommendation);
    }

    @Test
    void deleteRecommendation_shouldThrowException_whenNotFound() {
        // Arrange
        when(recommendationRepository.findById(999L)).thenReturn(
            Optional.empty()
        );

        // Act & Assert
        assertThatThrownBy(() -> service.deleteRecommendation(999L))
            .isInstanceOf(RecommendationNotFoundException.class)
            .hasMessageContaining("Recommandation introuvable");
    }

    @Test
    void getRecommendationById_shouldReturnRecommendation() {
        // Arrange
        Etudiant student = buildEtudiant();
        InternshipOffer offer = buildInternshipOffer();
        Gestionnaire gestionnaire = buildGestionnaire();
        InternshipRecommendation recommendation = buildRecommendation(
            student,
            offer,
            gestionnaire,
            PriorityCode.BLUE
        );

        when(recommendationRepository.findById(1L)).thenReturn(
            Optional.of(recommendation)
        );

        // Act
        RecommendationResponseDTO result = service.getRecommendationById(1L);

        // Assert
        assertNotNull(result);
        assertThat(result.getPriorityCode()).isEqualTo(PriorityCode.BLUE);
        verify(recommendationRepository).findById(1L);
    }

    @Test
    void deleteRecommendationByStudentAndOffer_shouldDeleteSuccessfully() {
        // Arrange
        Etudiant student = buildEtudiant();
        InternshipOffer offer = buildInternshipOffer();
        Gestionnaire gestionnaire = buildGestionnaire();
        InternshipRecommendation recommendation = buildRecommendation(
            student,
            offer,
            gestionnaire,
            PriorityCode.GREEN
        );

        when(
            recommendationRepository.findByStudentIdAndOfferId(1L, 1L)
        ).thenReturn(Optional.of(recommendation));

        // Act
        service.deleteRecommendationByStudentAndOffer(1L, 1L);

        // Assert
        verify(recommendationRepository).delete(recommendation);
    }
}
