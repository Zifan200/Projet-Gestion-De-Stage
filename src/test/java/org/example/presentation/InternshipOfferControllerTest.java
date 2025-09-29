package org.example.presentation;

import org.example.model.Employer;
import org.example.service.InternshipOfferService;
import org.example.service.dto.InternshipOfferListDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.exception.InvalidInternShipOffer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

public class InternshipOfferControllerTest {

    @Mock
    private InternshipOfferService internshipOfferService;

    @InjectMocks
    private InternshipOfferController internshipOfferController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

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

        when(internshipOfferService.getAllOffers()).thenReturn(List.of(offer1, offer2));

        // Act
        ResponseEntity<List<InternshipOfferListDto>> response = internshipOfferController.getAllInternshipOffers();

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody().get(0).getTitle()).isEqualTo("Dev Java");
        assertThat(response.getBody().get(1).getEnterpriseName()).isEqualTo("WebInc");
    }

    @Test
    void getAllInternshipOffers_shouldReturnEmptyList_whenNoOffers() {
        // Arrange
        when(internshipOfferService.getAllOffers()).thenReturn(List.of());

        // Act
        ResponseEntity<List<InternshipOfferListDto>> response = internshipOfferController.getAllInternshipOffers();

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isEmpty();
    }

    @Test
    void getInternshipOfferById_shouldReturnOffer() {
        Long offerId = 1L;
        InternshipOfferResponseDto offer = InternshipOfferResponseDto.builder()
                .title("Dev Java")
                .description("Stage backend Java")
                .target_programme("Informatique")
                .employerEmail(Employer.builder().email("alice@example.com").build())
                .expirationDate(LocalDate.now().plusDays(30))
                .build();

        when(internshipOfferService.getOfferById(offerId)).thenReturn(offer);

        ResponseEntity<InternshipOfferResponseDto> response =
                internshipOfferController.getInternshipOfferById(offerId);

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
        ResponseEntity<List<String>> response = internshipOfferController.getAllProgrammes();

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
}
