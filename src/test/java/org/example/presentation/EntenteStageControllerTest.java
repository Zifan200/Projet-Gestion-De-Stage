package org.example.presentation;

import org.example.model.InternshipApplication;
import org.example.model.auth.Role;
import org.example.repository.InternshipApplicationRepository;
import org.example.service.EntenteStageService;
import org.example.service.dto.entente.EntenteGenerationRequestDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class EntenteStageControllerTest {

    @Mock
    private EntenteStageService ententeStageService;

    @Mock
    private InternshipApplicationRepository internshipApplicationRepository;

    @InjectMocks
    private EntenteStageController ententeStageController;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(ententeStageController)
                .build();
    }

    private static final String BASE_PATH = "/api/v1/entente";


    /*@Test
    void shouldGeneratePdfWhenGestionnaireSignsFirst() throws Exception {
        // Arrange
        InternshipApplicationResponseDTO applicationDto = new InternshipApplicationResponseDTO();
        applicationDto.setId(1L);
        EntenteGenerationRequestDTO request = new EntenteGenerationRequestDTO();
        request.setApplication(applicationDto);
        request.setGestionnaireId(100L);

        byte[] pdfBytes = "PDF_GESTIONNAIRE".getBytes();

        InternshipApplication app = new InternshipApplication();
        app.setId(1L);
        app.setEntenteStagePdfId(999L);

        when(ententeStageService.generateEntenteDeStage(any(), eq(100L), eq(Role.GESTIONNAIRE)))
                .thenReturn(pdfBytes);
        when(internshipApplicationRepository.findById(1L))
                .thenReturn(Optional.of(app));

        // Act + Assert
        mockMvc.perform(post(BASE_PATH + "/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "application": { "id": 1 },
                              "gestionnaireId": 100,
                              "role": "GESTIONNAIRE"
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.pdfData").exists())
                .andExpect(jsonPath("$.id").exists());
    }

   /* @Test
    void shouldUpdatePdfViaPutEndpoint() throws Exception {
        // Arrange
        InternshipApplicationResponseDTO applicationDto = new InternshipApplicationResponseDTO();
        EntenteGenerationRequestDTO request = new EntenteGenerationRequestDTO();
        request.setId(1L); // ID du PDF
        request.setApplication(applicationDto);
        request.setGestionnaireId(100L);
        request.setRole(Role.EMPLOYER);

        byte[] pdfBytes = "PDF_UPDATED_VIA_PUT".getBytes();

        // Mock du service
        when(ententeStageService.updateEntenteDeStage(eq(1L), any(), eq(100L), eq(Role.EMPLOYER)))
                .thenReturn(pdfBytes);

        // Act + Assert
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(BASE_PATH + "/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "id": 1,
                          "application": { "id": 1 },
                          "gestionnaireId": 100,
                          "role": "EMPLOYER"
                        }
                    """))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(pdfBytes));
    }*/
}
