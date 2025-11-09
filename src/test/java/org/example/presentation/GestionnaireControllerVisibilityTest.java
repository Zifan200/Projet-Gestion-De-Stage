package org.example.presentation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import org.example.model.enums.ApprovalStatus;
import org.example.service.InternshipOfferService;
import org.example.service.dto.internship.InternshipOfferListDto;
import org.example.service.dto.internship.InternshipOfferResponseDto;
import org.example.service.dto.internship.OfferVisibilityDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class GestionnaireControllerVisibilityTest {

    @Mock
    private InternshipOfferService internshipOfferService;

    @InjectMocks
    private GestionnaireController gestionnaireController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void updateOfferVisibility_shouldReturn200WhenMakingVisible()
        throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            gestionnaireController
        ).build();

        OfferVisibilityDTO visibilityDTO = new OfferVisibilityDTO();
        visibilityDTO.setVisibleToStudents(true);

        InternshipOfferResponseDto responseDto =
            InternshipOfferResponseDto.builder()
                .id(1L)
                .title("Développeur Java")
                .status(ApprovalStatus.ACCEPTED)
                .visibleToStudents(true)
                .employerEmail("employer@test.com")
                .applicationCount(0)
                .publishedDate(LocalDate.now())
                .build();

        when(
            internshipOfferService.updateOfferVisibility(eq(1L), eq(true))
        ).thenReturn(responseDto);

        // Act & Assert
        mockMvc
            .perform(
                put("/api/v1/gs/offers/1/visibility")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(visibilityDTO))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.title").value("Développeur Java"))
            .andExpect(jsonPath("$.visibleToStudents").value(true));

        verify(internshipOfferService).updateOfferVisibility(1L, true);
    }

    @Test
    void updateOfferVisibility_shouldReturn200WhenMakingHidden()
        throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            gestionnaireController
        ).build();

        OfferVisibilityDTO visibilityDTO = new OfferVisibilityDTO();
        visibilityDTO.setVisibleToStudents(false);

        InternshipOfferResponseDto responseDto =
            InternshipOfferResponseDto.builder()
                .id(2L)
                .title("Analyste QA")
                .status(ApprovalStatus.ACCEPTED)
                .visibleToStudents(false)
                .employerEmail("employer@test.com")
                .applicationCount(0)
                .publishedDate(LocalDate.now())
                .build();

        when(
            internshipOfferService.updateOfferVisibility(eq(2L), eq(false))
        ).thenReturn(responseDto);

        // Act & Assert
        mockMvc
            .perform(
                put("/api/v1/gs/offers/2/visibility")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(visibilityDTO))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.title").value("Analyste QA"))
            .andExpect(jsonPath("$.visibleToStudents").value(false));

        verify(internshipOfferService).updateOfferVisibility(2L, false);
    }

    @Test
    void updateOfferVisibility_shouldReturn400WhenVisibilityIsNull()
        throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            gestionnaireController
        ).build();

        OfferVisibilityDTO visibilityDTO = new OfferVisibilityDTO();
        visibilityDTO.setVisibleToStudents(null);

        // Act & Assert
        mockMvc
            .perform(
                put("/api/v1/gs/offers/1/visibility")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(visibilityDTO))
            )
            .andExpect(status().isBadRequest());

        verify(internshipOfferService, never()).updateOfferVisibility(
            anyLong(),
            anyBoolean()
        );
    }

    @Test
    void getAllOffers_shouldReturn200WithAllOffers() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            gestionnaireController
        ).build();

        InternshipOfferListDto offer1 = InternshipOfferListDto.builder()
            .id(1L)
            .title("Développeur Java")
            .enterpriseName("Tech Corp")
            .status(ApprovalStatus.ACCEPTED)
            .expirationDate(LocalDate.now().plusDays(30))
            .build();

        InternshipOfferListDto offer2 = InternshipOfferListDto.builder()
            .id(2L)
            .title("Analyste QA")
            .enterpriseName("Quality Inc")
            .status(ApprovalStatus.PENDING)
            .expirationDate(LocalDate.now().plusDays(15))
            .build();

        when(internshipOfferService.getAllOffersSummary()).thenReturn(
            List.of(offer1, offer2)
        );

        // Act & Assert
        mockMvc
            .perform(
                get("/api/v1/gs/offers").contentType(MediaType.APPLICATION_JSON)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].title").value("Développeur Java"))
            .andExpect(jsonPath("$[0].enterpriseName").value("Tech Corp"))
            .andExpect(jsonPath("$[1].id").value(2))
            .andExpect(jsonPath("$[1].title").value("Analyste QA"))
            .andExpect(jsonPath("$[1].enterpriseName").value("Quality Inc"));

        verify(internshipOfferService).getAllOffersSummary();
    }

    @Test
    void getAllOffers_shouldReturn200WithEmptyList() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            gestionnaireController
        ).build();

        when(internshipOfferService.getAllOffersSummary()).thenReturn(
            List.of()
        );

        // Act & Assert
        mockMvc
            .perform(
                get("/api/v1/gs/offers").contentType(MediaType.APPLICATION_JSON)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        verify(internshipOfferService).getAllOffersSummary();
    }
}
