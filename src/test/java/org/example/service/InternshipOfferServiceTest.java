package org.example.service;

import org.example.event.EmployerCreatedInternshipOfferEvent;
import org.example.event.UserCreatedEvent;
import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.EmployerDto;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferListDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.exception.InvalidInternShipOffer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.assertj.core.api.Assertions.assertThat;


import java.time.LocalDate;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InternshipOfferServiceTest {

    @Mock
    private EmployerRepository employerRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @InjectMocks
    private EmployerService employerService;

    @Mock
    private InternshipOfferRepository internshipOfferRepository;
    @InjectMocks
    private InternshipOfferService internshipOfferService;

    private EmployerDto buildEmployerDto() {
        return EmployerDto.builder()
                .email("test@google.com")
                .firstName("Test Firstname")
                .lastName("Test LastName")
                .password("password")
                .since(LocalDate.now())
                .enterpriseName("Test enterprise")
                .build();
    }

    private Employer buildEmployer() {
        return Employer.builder()
                .email("test@google.com")
                .firstName("Test Firstname")
                .lastName("Test LastName")
                .password("password")
                .since(LocalDate.now())
                .enterpriseName("Test enterprise")
                .build();
    }

    private InternshipOffer buildInternshipOffer(Employer employer, LocalDate offerPublishDateTime) {
        return InternshipOffer.builder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .employer(employer)
                .publishedDate(offerPublishDateTime)
                .build();
    }

    private InternshipOfferDto buildInternshipOfferDto(String email, LocalDate offerPublishDateTime) {
        return InternshipOfferDto.builder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .employerEmail(email)
                .publishedDate(offerPublishDateTime)
                .build();
    }

    @Test
    void createInternshipOffer_shouldSaveInternshipOffer() {
        //Arrange
        Employer employer = buildEmployer();
        EmployerDto employerDto = buildEmployerDto();
        LocalDate offerPublishDateTime = LocalDate.now();
        InternshipOffer createdOffer = buildInternshipOffer(employer, offerPublishDateTime);

        when(employerRepository.findByCredentialsEmail(employerDto.getEmail()))
                .thenReturn(Optional.of(employer));
        when(internshipOfferRepository.save(any(InternshipOffer.class)))
                .thenReturn(createdOffer);

        //Act
        InternshipOfferDto internshipOfferDto = buildInternshipOfferDto(employerDto.getEmail(), offerPublishDateTime);
        InternshipOfferResponseDto savedOffer = internshipOfferService.saveInternshipOffer(internshipOfferDto);

        //Assert
        assertNotNull(savedOffer);
        assertThat(savedOffer)
                .extracting(InternshipOfferResponseDto::getTitle, InternshipOfferResponseDto::getPublishedDate)
                .containsExactly("recherche Scratch Developer", offerPublishDateTime);

        verify(internshipOfferRepository).save(any(InternshipOffer.class));
        verify(eventPublisher).publishEvent(any(EmployerCreatedInternshipOfferEvent.class));
    }

    @Test
    void createInternshipOffer_shouldHaveReferenceToEmployer() {
        //Arrange
        Employer employer = buildEmployer();
        EmployerDto employerDto = buildEmployerDto();
        LocalDate offerPublishDateTime = LocalDate.now();
        InternshipOffer createdOffer = buildInternshipOffer(employer, offerPublishDateTime);

        when(employerRepository.findByCredentialsEmail(employerDto.getEmail()))
                .thenReturn(Optional.of(employer));
        when(internshipOfferRepository.save(any(InternshipOffer.class)))
                .thenReturn(createdOffer);

        //Act
        InternshipOfferDto internshipOfferDto = buildInternshipOfferDto(employerDto.getEmail(), offerPublishDateTime);
        InternshipOfferResponseDto savedOffer = internshipOfferService.saveInternshipOffer(internshipOfferDto);

        //Assert
        assertNotNull(savedOffer);
        assertNotNull(savedOffer.getEmployerEmail());
        assertTrue(savedOffer.getEmployerEmail().equalsIgnoreCase("test@google.com"));
        assertNotNull(employerRepository.findByCredentialsEmail("test@google.com"));

        verify(eventPublisher).publishEvent(any(EmployerCreatedInternshipOfferEvent.class));
    }

    @Test
    void createOfferWithMissingInformation_shouldNotSave() {
        InternshipOfferDto internshipOfferDto = InternshipOfferDto.builder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .build();

        assertThatThrownBy(() -> internshipOfferService.saveInternshipOffer(internshipOfferDto))
                .isInstanceOf(InvalidInternShipOffer.class);
        verify(internshipOfferRepository, never()).save(any());
    }
    @Test
    void getAllOffers_shouldReturnListOfOffers() {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer1 = buildInternshipOffer(employer, LocalDate.now());
        InternshipOffer offer2 = buildInternshipOffer(employer, LocalDate.now().plusDays(1));
        offer2.setTitle("Frontend Developer");

        when(internshipOfferRepository.findAll())
                .thenReturn(List.of(offer1, offer2));

        // Act
        List<InternshipOfferListDto> offers = internshipOfferService.getAllOffersSummary();

        // Assert
        assertThat(offers).hasSize(2);
        assertThat(offers.get(0).getTitle()).isEqualTo("recherche Scratch Developer");
        assertThat(offers.get(1).getTitle()).isEqualTo("Frontend Developer");
    }

    @Test
    void getOffersByProgramme_shouldReturnFilteredOffers() {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer1 = buildInternshipOffer(employer, LocalDate.now());
        offer1.setTargetedProgramme("Informatique");
        InternshipOffer offer2 = buildInternshipOffer(employer, LocalDate.now());
        offer2.setTitle("Frontend Developer");
        offer2.setTargetedProgramme("Science de la nature");

        when(internshipOfferRepository.findAll())
                .thenReturn(List.of(offer1, offer2));

        // Act
        List<InternshipOfferListDto> filteredOffers = internshipOfferService.getOffersByProgramme("Informatique");

        // Assert
        assertThat(filteredOffers).hasSize(1);
        assertThat(filteredOffers.get(0).getTitle()).isEqualTo("recherche Scratch Developer");
        assertThat(filteredOffers.get(0).getEnterpriseName()).isEqualTo(employer.getEnterpriseName());
    }

    @Test
    void getAllTargetedProgrammes_shouldReturnDistinctSortedList() {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer1 = buildInternshipOffer(employer, LocalDate.now());
        offer1.setTargetedProgramme("Informatique");
        InternshipOffer offer2 = buildInternshipOffer(employer, LocalDate.now());
        offer2.setTargetedProgramme("Science de la nature");
        InternshipOffer offer3 = buildInternshipOffer(employer, LocalDate.now());
        offer3.setTargetedProgramme("Informatique"); // doublon

        when(internshipOfferRepository.findAll())
                .thenReturn(List.of(offer1, offer2, offer3));

        // Act
        List<String> programmes = internshipOfferService.getAllTargetedProgrammes();

        // Assert
        assertThat(programmes).hasSize(2);
        assertThat(programmes).containsExactly("Informatique", "Science de la nature");
    }

    @Test
    void getAllOffers_whenNoOffers_shouldReturnEmptyList() {
        // Arrange
        when(internshipOfferRepository.findAll()).thenReturn(List.of());

        // Act
        List<InternshipOfferListDto> offers = internshipOfferService.getAllOffersSummary();

        // Assert
        assertThat(offers).isEmpty();
    }

    @Test
    void getOffersByProgramme_whenNoMatchingOffers_shouldReturnEmptyList() {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer1 = buildInternshipOffer(employer, LocalDate.now());
        offer1.setTargetedProgramme("Informatique");
        when(internshipOfferRepository.findAll()).thenReturn(List.of(offer1));

        // Act
        List<InternshipOfferListDto> filteredOffers = internshipOfferService.getOffersByProgramme("Science de la nature");

        // Assert
        assertThat(filteredOffers).isEmpty();
    }

    @Test
    void updateOfferStatus_shouldUpdateStatusSuccessfully() {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer = buildInternshipOffer(employer, LocalDate.now());
        offer.setId(1L);
        offer.setStatus(null);

        when(internshipOfferRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(internshipOfferRepository.save(any(InternshipOffer.class))).thenReturn(offer);

        // Act
        internshipOfferService.updateOfferStatus(1L, org.example.model.enums.InternshipOfferStatus.ACCEPTED);

        // Assert
        assertThat(offer.getStatus()).isEqualTo(org.example.model.enums.InternshipOfferStatus.ACCEPTED);
        verify(internshipOfferRepository).save(offer);
    }

    @Test
    void updateOfferStatus_shouldThrowWhenOfferIdNotFound() {
        // Arrange
        when(internshipOfferRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> internshipOfferService.updateOfferStatus(99L, org.example.model.enums.InternshipOfferStatus.ACCEPTED))
                .isInstanceOf(InvalidInternShipOffer.class)
                .hasMessageContaining("Offer not found");
        verify(internshipOfferRepository, never()).save(any());
    }

    @Test
    void getAcceptedOffers_shouldReturnOnlyAcceptedOffers() {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer1 = buildInternshipOffer(employer, LocalDate.now());
        offer1.setId(1L);
        offer1.setStatus(org.example.model.enums.InternshipOfferStatus.ACCEPTED);

        InternshipOffer offer2 = buildInternshipOffer(employer, LocalDate.now());
        offer2.setId(2L);
        offer2.setStatus(org.example.model.enums.InternshipOfferStatus.PENDING);

        InternshipOffer offer3 = buildInternshipOffer(employer, LocalDate.now());
        offer3.setId(3L);
        offer3.setStatus(org.example.model.enums.InternshipOfferStatus.ACCEPTED);

        when(internshipOfferRepository.findDistinctByStatus(org.example.model.enums.InternshipOfferStatus.ACCEPTED))
                .thenReturn(List.of(offer1, offer3));

        // Act
        List<InternshipOfferDto> acceptedOffers = internshipOfferService.getAcceptedOffers();

        // Assert
        assertThat(acceptedOffers).hasSize(2);
        assertThat(acceptedOffers).extracting("title")
                .containsExactlyInAnyOrder(offer1.getTitle(), offer3.getTitle());
    }

    @Test
    void getAcceptedOffers_whenNoAcceptedOffers_shouldReturnEmptyList() {
        // Arrange
        when(internshipOfferRepository.findDistinctByStatus(org.example.model.enums.InternshipOfferStatus.ACCEPTED))
                .thenReturn(List.of());

        // Act
        List<InternshipOfferDto> acceptedOffers = internshipOfferService.getAcceptedOffers();

        // Assert
        assertThat(acceptedOffers).isEmpty();
    }

    @Test
    void getPendingOffers_shouldReturnOnlyPendingOffers() {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer1 = buildInternshipOffer(employer, LocalDate.now());
        offer1.setId(1L);
        offer1.setStatus(org.example.model.enums.InternshipOfferStatus.PENDING);

        InternshipOffer offer2 = buildInternshipOffer(employer, LocalDate.now());
        offer2.setId(2L);
        offer2.setStatus(org.example.model.enums.InternshipOfferStatus.ACCEPTED);

        InternshipOffer offer3 = buildInternshipOffer(employer, LocalDate.now());
        offer3.setId(3L);
        offer3.setStatus(org.example.model.enums.InternshipOfferStatus.PENDING);

        when(internshipOfferRepository.findDistinctByStatus(org.example.model.enums.InternshipOfferStatus.PENDING))
                .thenReturn(List.of(offer1, offer3));

        // Act
        List<InternshipOfferDto> pendingOffers = internshipOfferService.getPendingOffers();

        // Assert
        assertThat(pendingOffers).hasSize(2);
        assertThat(pendingOffers).extracting("title")
                .containsExactlyInAnyOrder(offer1.getTitle(), offer3.getTitle());
    }

    @Test
    void getPendingOffers_whenNoPendingOffers_shouldReturnEmptyList() {
        // Arrange
        when(internshipOfferRepository.findDistinctByStatus(org.example.model.enums.InternshipOfferStatus.PENDING))
                .thenReturn(List.of());

        // Act
        List<InternshipOfferDto> pendingOffers = internshipOfferService.getPendingOffers();

        // Assert
        assertThat(pendingOffers).isEmpty();
    }

    @Test
    void getRejectedOffers_shouldReturnOnlyRefusedOffers() {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer1 = buildInternshipOffer(employer, LocalDate.now());
        offer1.setId(1L);
        offer1.setStatus(org.example.model.enums.InternshipOfferStatus.REJECTED);

        InternshipOffer offer2 = buildInternshipOffer(employer, LocalDate.now());
        offer2.setId(2L);
        offer2.setStatus(org.example.model.enums.InternshipOfferStatus.ACCEPTED);

        InternshipOffer offer3 = buildInternshipOffer(employer, LocalDate.now());
        offer3.setId(3L);
        offer3.setStatus(org.example.model.enums.InternshipOfferStatus.REJECTED);

        when(internshipOfferRepository.findDistinctByStatus(org.example.model.enums.InternshipOfferStatus.REJECTED))
                .thenReturn(List.of(offer1, offer3));

        // Act
        List<InternshipOfferDto> refusedOffers = internshipOfferService.getRejectedOffers();

        // Assert
        assertThat(refusedOffers).hasSize(2);
        assertThat(refusedOffers).extracting("title")
                .containsExactlyInAnyOrder(offer1.getTitle(), offer3.getTitle());
    }

    @Test
    void getRejectedOffers_whenNoRefusedOffers_shouldReturnEmptyList() {
        // Arrange
        when(internshipOfferRepository.findDistinctByStatus(org.example.model.enums.InternshipOfferStatus.REJECTED))
                .thenReturn(List.of());

        // Act
        List<InternshipOfferDto> refusedOffers = internshipOfferService.getRejectedOffers();

        // Assert
        assertThat(refusedOffers).isEmpty();
    }


}
