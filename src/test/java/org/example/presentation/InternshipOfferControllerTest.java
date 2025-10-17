package org.example.presentation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.example.model.enums.InternshipOfferStatus;
import org.example.presentation.exception.EmployerControllerException;
import org.example.presentation.exception.InternshipOfferControllerException;
import org.example.service.InternshipApplicationService;
import org.example.service.InternshipOfferService;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferListDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.exception.InvalidInternShipOffer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class InternshipOfferControllerTest {

    @Mock
    private InternshipOfferService internshipOfferService;
    @InjectMocks
    private InternshipOfferController internshipOfferController;

    @Test
    void getAllInternshipOffers_shouldReturnOffers() {
        // Arrange
        InternshipOfferListDto offer1 = InternshipOfferListDto.builder()
                .id(1L)
                .title("Dev Java")
                .enterpriseName("TechCorp")
                .expirationDate(LocalDate.now().plusDays(30))
                .build();

        InternshipOfferListDto offer2 = InternshipOfferListDto.builder()
                .id(2L)
                .title("Frontend React")
                .enterpriseName("WebInc")
                .expirationDate(LocalDate.now().plusDays(25))
                .build();

        when(internshipOfferService.getAllOffersSummary()).thenReturn(List.of(offer1, offer2));

        // Act
        ResponseEntity<List<InternshipOfferListDto>> response = internshipOfferController.getAllInternshipOffersSummary();

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody().get(0).getTitle()).isEqualTo("Dev Java");
        assertThat(response.getBody().get(1).getEnterpriseName()).isEqualTo("WebInc");
    }

    @Test
    void getAllInternshipOffers_shouldReturnEmptyList_whenNoOffers() {
        // Arrange
        when(internshipOfferService.getAllOffersSummary()).thenReturn(List.of());

        // Act
        ResponseEntity<List<InternshipOfferListDto>> response = internshipOfferController.getAllInternshipOffersSummary();

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isEmpty();
    }

    @Test
    void getInternshipOfferById_shouldReturnOffer() {
        Long offerId = 1L;
        Employer employer  =    Employer.builder().email("alice@example.com").build();
        InternshipOfferResponseDto offer = InternshipOfferResponseDto.builder()
                .title("Dev Java")
                .description("Stage backend Java")
                .targetedProgramme("Informatique")
                .employerEmail(employer.getEmail())
                .expirationDate(LocalDate.now().plusDays(30))
                .build();

        when(internshipOfferService.getOfferById(offerId)).thenReturn(offer);

        ResponseEntity<InternshipOfferResponseDto> response =
                internshipOfferController.getInternshipOfferById(offerId);
        System.out.println(response.getBody());
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody().getTitle()).isEqualTo("Dev Java");
        assertThat(response.getBody().getTargetedProgramme()).isEqualTo("Informatique");
        assertThat(response.getBody().getEmployerEmail()).isEqualTo("alice@example.com");
    }


    @Test
    void getInternshipOfferById_shouldReturnNotFound_whenOfferDoesNotExist() {
        // Arrange
        Long offerId = 99L;
        when(internshipOfferService.getOfferById(offerId))
                .thenThrow(new InvalidInternShipOffer("Offer not found with id: " + offerId));

        // Act
        ResponseEntity<InternshipOfferResponseDto> response = internshipOfferController.getInternshipOfferById(offerId);

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(404);
        assertThat(response.getBody()).isNull();
    }


    @Test
    void getAllProgrammes_shouldReturnListOfProgrammes() {
        // Arrange
        when(internshipOfferService.getAllTargetedProgrammes())
                .thenReturn(List.of("Informatique", "Science de la nature"));

        // Act
        ResponseEntity<List<String>> response = internshipOfferController.getAllProgrammesName();

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody()).containsExactly("Informatique", "Science de la nature");
    }

    @Test
    void getAcceptedOffersByProgramme_shouldReturnFilteredAcceptedOffers() {
        // Arrange
        String programme = "Informatique";

        InternshipOfferListDto offer1 = InternshipOfferListDto.builder()
                .id(1L)
                .title("Développeur Java")
                .enterpriseName("TechCorp")
                .expirationDate(LocalDate.now().plusDays(30))
                .build();

        InternshipOfferListDto offer2 = InternshipOfferListDto.builder()
                .id(2L)
                .title("Frontend React")
                .enterpriseName("TechCorp")
                .expirationDate(LocalDate.now().plusDays(25))
                .build();

        when(internshipOfferService.getAcceptedOffersByProgramme(programme))
                .thenReturn(List.of(offer1, offer2));

        // Act
        ResponseEntity<List<InternshipOfferListDto>> response =
                internshipOfferController.getAcceptedOffersByProgramme(programme);

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody().get(0).getTitle()).isEqualTo("Développeur Java");
        assertThat(response.getBody().get(1).getTitle()).isEqualTo("Frontend React");
    }

    @Test
    void getAcceptedOffersByProgramme_shouldReturnEmptyList_whenNoAcceptedOffers() {
        // Arrange
        String programme = "Science de la nature";
        when(internshipOfferService.getAcceptedOffersByProgramme(programme))
                .thenReturn(List.of());

        // Act
        ResponseEntity<List<InternshipOfferListDto>> response =
                internshipOfferController.getAcceptedOffersByProgramme(programme);

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isEmpty();
    }

    @Test
    void updateSelectedInternshipOfferStatus_shouldReturnSelectedInternshipOfferWithNewStatus() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipOfferController)
                .setControllerAdvice(new InternshipOfferControllerException())
                .build();

        Employer employer = Employer.builder()
                .firstName("John")
                .lastName("Doe")
                .email("johndoes@gmail.com")
                .phone("123-456-7890")
                .enterpriseName("TechCorp")
                .password("12345")
                .build();

        InternshipOffer offer = InternshipOffer.builder()
                .id(0L)
                .title("Java Dev")
                .description("N/A")
                .employer(employer)
                .targetedProgramme("Computer Science")
                .build();

        InternshipOfferResponseDto offerResponse = InternshipOfferResponseDto.create(offer);
        offerResponse.setStatus(InternshipOfferStatus.PENDING);

        InternshipOfferResponseDto updatedResponse = InternshipOfferResponseDto.create(offer);
        updatedResponse.setStatus(InternshipOfferStatus.ACCEPTED);

        when(internshipOfferService.updateOfferStatus(offerResponse.getId(), InternshipOfferStatus.ACCEPTED, "the offer looks good"))
                .thenReturn(updatedResponse);

        mockMvc.perform(post("/api/v1/internship-offers/{id}/update-status", offerResponse.getId())
                        .param("status", "ACCEPTED")
                        .param("reason", "the offer looks good")
                        .contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Java Dev"))
                .andExpect(jsonPath("$.description").value("N/A"))
                .andExpect(jsonPath("$.targetedProgramme").value("Computer Science"))
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test
    void updateSelectedInternshipOfferStatusThatDoesntExist_shouldReturnError() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipOfferController)
                .setControllerAdvice(new InternshipOfferControllerException())
                .build();

        when(internshipOfferService.updateOfferStatus(eq(100L), eq(InternshipOfferStatus.ACCEPTED), anyString()))
                .thenThrow(new InvalidInternShipOffer("Offer not found"));

        mockMvc.perform(post("/api/v1/internship-offers/100/update-status")
                        .param("status","ACCEPTED")
                        .param("reason", "None")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void downloadInternshipOfferPdf_Success() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipOfferController)
                .setControllerAdvice(new InternshipOfferControllerException())
                .build();

        Long offerId = 1L;
        byte[] mockPDF = "MOCK_PDF_BYTES".getBytes();

        when(internshipOfferService.generateInternshipOfferPdf(offerId))
                .thenReturn(mockPDF);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/v1/internship-offers/{id}/create-pdf", offerId))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=internship_offer.pdf"))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(mockPDF));

        verify(internshipOfferService, times(1)).generateInternshipOfferPdf(offerId);
    }

    @Test
    void downloadInternshipOfferPdf_Failure() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipOfferController)
                .setControllerAdvice(new InternshipOfferControllerException())
                .build();

        Long invalidId = 2L;

        when(internshipOfferService.generateInternshipOfferPdf(invalidId))
                .thenThrow(new InvalidInternShipOffer("Demande de téléchargement invalide."));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/v1/internship-offers/{id}/create-pdf", invalidId))
                .andExpect(status().isBadRequest());
    }

    @Test
    void downloadPdf_Mock() throws Exception {
        byte[] fakePdf = "PDF_FAKE".getBytes();

        when(internshipOfferService.generateInternshipOfferPdf(1L)).thenReturn(fakePdf);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(internshipOfferController).build();

        var result = mockMvc.perform(
                        get("/api/v1/internship-offers/{id}/create-pdf", 1L)
                                .accept(MediaType.APPLICATION_PDF))
                .andExpect(status().isOk())
                .andReturn();

        String userHome = System.getProperty("user.home");
        java.nio.file.Path downloadsPath = java.nio.file.Paths.get(userHome, "Downloads", "internship_offer_test.pdf");
        java.nio.file.Files.write(downloadsPath, result.getResponse().getContentAsByteArray());

        System.out.println("Fichier PDF téléchargé : " + downloadsPath.toAbsolutePath());
    }
}
