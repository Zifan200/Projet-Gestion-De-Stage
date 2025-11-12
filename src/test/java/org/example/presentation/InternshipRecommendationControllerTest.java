package org.example.presentation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import org.example.model.auth.Role;
import org.example.model.enums.PriorityCode;
import org.example.security.exception.UserNotFoundException;
import org.example.service.InternshipRecommendationService;
import org.example.service.UserAppService;
import org.example.service.dto.recommendation.RecommendationRequestDTO;
import org.example.service.dto.recommendation.RecommendationResponseDTO;
import org.example.service.dto.util.UserDTO;
import org.example.service.exception.MaxGoldRecommendationsException;
import org.example.service.exception.RecommendationNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class InternshipRecommendationControllerTest {

    @Mock
    private InternshipRecommendationService recommendationService;

    @Mock
    private UserAppService userAppService;

    @InjectMocks
    private InternshipRecommendationController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private final String path = "/api/v1/recommendations";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
    }

    private UserDTO buildGestionnaireUser() {
        UserDTO user = new UserDTO();
        user.setId(1L);
        user.setEmail("gestionnaire@test.com");
        user.setFirstName("François");
        user.setLastName("Lacoursière");
        user.setRole(Role.GESTIONNAIRE);
        return user;
    }

    private UserDTO buildStudentUser() {
        UserDTO user = new UserDTO();
        user.setId(2L);
        user.setEmail("student@test.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setRole(Role.STUDENT);
        return user;
    }

    private RecommendationResponseDTO buildRecommendationResponse() {
        return RecommendationResponseDTO.builder()
            .id(1L)
            .studentId(1L)
            .studentName("John Doe")
            .offerId(1L)
            .offerTitle("Développeur Java")
            .gestionnaireId(1L)
            .gestionnaireName("François Lacoursière")
            .priorityCode(PriorityCode.GOLD)
            .recommendedAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }

    @Test
    void createRecommendation_shouldReturn201_whenGestionnaireCreatesRecommendation()
        throws Exception {
        // Arrange
        RecommendationRequestDTO requestDTO = RecommendationRequestDTO.builder()
            .studentId(1L)
            .offerId(1L)
            .priorityCode(PriorityCode.GOLD)
            .build();

        RecommendationResponseDTO responseDTO = buildRecommendationResponse();
        UserDTO gestionnaireUser = buildGestionnaireUser();

        when(userAppService.getMe(anyString())).thenReturn(gestionnaireUser);
        when(
            recommendationService.createOrUpdateRecommendation(
                any(),
                anyString()
            )
        ).thenReturn(responseDTO);

        // Act & Assert
        mockMvc
            .perform(
                post(path)
                    .header("Authorization", "Bearer fake-token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO))
            )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.priorityCode").value("GOLD"))
            .andExpect(jsonPath("$.studentName").value("John Doe"));

        verify(recommendationService).createOrUpdateRecommendation(
            any(),
            anyString()
        );
    }

    @Test
    void createRecommendation_shouldReturn403_whenNonGestionnaireTriesToCreate()
        throws Exception {
        // Arrange
        RecommendationRequestDTO requestDTO = RecommendationRequestDTO.builder()
            .studentId(1L)
            .offerId(1L)
            .priorityCode(PriorityCode.BLUE)
            .build();

        UserDTO studentUser = buildStudentUser();

        when(userAppService.getMe(anyString())).thenReturn(studentUser);

        // Act & Assert
        mockMvc
            .perform(
                post(path)
                    .header("Authorization", "Bearer fake-token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO))
            )
            .andExpect(status().isForbidden())
            .andExpect(
                content().string(
                    "Seuls les gestionnaires peuvent créer des recommandations"
                )
            );
    }

    @Test
    void createRecommendation_shouldReturn404_whenStudentNotFound()
        throws Exception {
        // Arrange
        RecommendationRequestDTO requestDTO = RecommendationRequestDTO.builder()
            .studentId(999L)
            .offerId(1L)
            .priorityCode(PriorityCode.GREEN)
            .build();

        UserDTO gestionnaireUser = buildGestionnaireUser();

        when(userAppService.getMe(anyString())).thenReturn(gestionnaireUser);
        when(
            recommendationService.createOrUpdateRecommendation(
                any(),
                anyString()
            )
        ).thenThrow(new UserNotFoundException("Étudiant introuvable"));

        // Act & Assert
        mockMvc
            .perform(
                post(path)
                    .header("Authorization", "Bearer fake-token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO))
            )
            .andExpect(status().isNotFound())
            .andExpect(content().string("userNotFound"));
    }

    @Test
    void createRecommendation_shouldReturn400_whenMaxGoldReached()
        throws Exception {
        // Arrange
        RecommendationRequestDTO requestDTO = RecommendationRequestDTO.builder()
            .studentId(1L)
            .offerId(1L)
            .priorityCode(PriorityCode.GOLD)
            .build();

        UserDTO gestionnaireUser = buildGestionnaireUser();

        when(userAppService.getMe(anyString())).thenReturn(gestionnaireUser);
        when(
            recommendationService.createOrUpdateRecommendation(
                any(),
                anyString()
            )
        ).thenThrow(
            new MaxGoldRecommendationsException(
                "Maximum de 3 recommandations OR atteint pour cet étudiant"
            )
        );

        // Act & Assert
        mockMvc
            .perform(
                post(path)
                    .header("Authorization", "Bearer fake-token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO))
            )
            .andExpect(status().isBadRequest())
            .andExpect(
                content().string(
                    "Maximum de 3 recommandations OR atteint pour cet étudiant"
                )
            );
    }

    @Test
    void getRecommendationsForStudent_shouldReturn200() throws Exception {
        // Arrange
        List<RecommendationResponseDTO> recommendations = Arrays.asList(
            buildRecommendationResponse()
        );

        when(recommendationService.getRecommendationsForStudent(1L)).thenReturn(
            recommendations
        );

        // Act & Assert
        mockMvc
            .perform(get(path + "/student/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].studentId").value(1))
            .andExpect(jsonPath("$[0].priorityCode").value("GOLD"));
    }

    @Test
    void getRecommendationsForOffer_shouldReturn200() throws Exception {
        // Arrange
        List<RecommendationResponseDTO> recommendations = Arrays.asList(
            buildRecommendationResponse()
        );

        when(recommendationService.getRecommendationsForOffer(1L)).thenReturn(
            recommendations
        );

        // Act & Assert
        mockMvc
            .perform(get(path + "/offer/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].offerId").value(1));
    }

    @Test
    void getAllRecommendations_shouldReturn200() throws Exception {
        // Arrange
        List<RecommendationResponseDTO> recommendations = Arrays.asList(
            buildRecommendationResponse()
        );

        when(recommendationService.getAllRecommendations()).thenReturn(
            recommendations
        );

        // Act & Assert
        mockMvc
            .perform(get(path))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getRecommendationById_shouldReturn200() throws Exception {
        // Arrange
        RecommendationResponseDTO response = buildRecommendationResponse();

        when(recommendationService.getRecommendationById(1L)).thenReturn(
            response
        );

        // Act & Assert
        mockMvc
            .perform(get(path + "/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.priorityCode").value("GOLD"));
    }

    @Test
    void getRecommendationById_shouldReturn404_whenNotFound() throws Exception {
        // Arrange
        when(recommendationService.getRecommendationById(999L)).thenThrow(
            new RecommendationNotFoundException("Recommandation introuvable")
        );

        // Act & Assert
        mockMvc
            .perform(get(path + "/999"))
            .andExpect(status().isNotFound())
            .andExpect(content().string("Recommandation introuvable"));
    }

    @Test
    void deleteRecommendation_shouldReturn204() throws Exception {
        // Arrange - no exception means successful deletion

        // Act & Assert
        mockMvc.perform(delete(path + "/1")).andExpect(status().isNoContent());

        verify(recommendationService).deleteRecommendation(1L);
    }

    @Test
    void deleteRecommendation_shouldReturn404_whenNotFound() throws Exception {
        // Arrange
        doThrow(
            new RecommendationNotFoundException("Recommandation introuvable")
        )
            .when(recommendationService)
            .deleteRecommendation(999L);

        // Act & Assert
        mockMvc
            .perform(delete(path + "/999"))
            .andExpect(status().isNotFound())
            .andExpect(content().string("Recommandation introuvable"));
    }

    @Test
    void deleteRecommendationByStudentAndOffer_shouldReturn204()
        throws Exception {
        // Arrange - no exception means successful deletion

        // Act & Assert
        mockMvc
            .perform(delete(path + "/student/1/offer/1"))
            .andExpect(status().isNoContent());

        verify(recommendationService).deleteRecommendationByStudentAndOffer(
            1L,
            1L
        );
    }

    @Test
    void deleteRecommendationByStudentAndOffer_shouldReturn404_whenNotFound()
        throws Exception {
        // Arrange
        doThrow(
            new RecommendationNotFoundException(
                "Recommandation introuvable pour cet étudiant et cette offre"
            )
        )
            .when(recommendationService)
            .deleteRecommendationByStudentAndOffer(999L, 999L);

        // Act & Assert
        mockMvc
            .perform(delete(path + "/student/999/offer/999"))
            .andExpect(status().isNotFound())
            .andExpect(
                content().string(
                    "Recommandation introuvable pour cet étudiant et cette offre"
                )
            );
    }
}
