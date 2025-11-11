package org.example.service;

import org.example.event.EmployerCreatedInternshipOfferEvent;
import org.example.model.Employer;
import org.example.model.InternshipApplication;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.employer.EmployerDto;
import org.example.service.dto.internship.InternshipOfferDto;
import org.example.service.dto.internship.InternshipOfferListDto;
import org.example.service.dto.internship.InternshipOfferResponseDto;
import org.example.service.exception.InvalidInternShipOffer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

//import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
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

    @InjectMocks
    private InternshipOfferService service;

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

    private EmployerDto buildEmployerDto(Employer employer) {
        return EmployerDto.builder()
                .email(employer.getEmail())
                .firstName(employer.getFirstName())
                .lastName(employer.getLastName())
                .password(employer.getPassword())
                .since(LocalDate.now())
                .enterpriseName(employer.getEnterpriseName())
                .build();
    }

    private InternshipOffer buildInternshipOffer(Employer employer, LocalDate offerPublishDateTime) {
        return InternshipOffer.builder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .employer(employer)
                .publishedDate(offerPublishDateTime)
                .salary(18.25f)
                .applications(new ArrayList<>())
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
        float offerSalary = 18.25f;
        InternshipOffer createdOffer = buildInternshipOffer(employer, offerPublishDateTime);

        when(employerRepository.findByCredentialsEmail(employerDto.getEmail()))
                .thenReturn(Optional.of(employer));
        when(internshipOfferRepository.save(any(InternshipOffer.class)))
                .thenReturn(createdOffer);

        //Act
        InternshipOfferDto internshipOfferDto = buildInternshipOfferDto(employerDto.getEmail(), offerPublishDateTime);
        InternshipOfferResponseDto savedOffer = internshipOfferService.saveInternshipOffer(employerDto.getEmail(), internshipOfferDto);

        //Assert
        assertNotNull(savedOffer);
        assertThat(savedOffer).extracting(InternshipOfferResponseDto::getTitle, InternshipOfferResponseDto::getPublishedDate)
                .containsExactly("recherche Scratch Developer", offerPublishDateTime);

        verify(internshipOfferRepository).save(any(InternshipOffer.class));
        verify(eventPublisher).publishEvent(any(EmployerCreatedInternshipOfferEvent.class));
        assertSame(savedOffer.getPublishedDate(), offerPublishDateTime);
        assertEquals(savedOffer.getSalary(), offerSalary);
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
        InternshipOfferResponseDto savedOffer = internshipOfferService.saveInternshipOffer(internshipOfferDto.getEmployerEmail(),internshipOfferDto);

        //Assert
        assertNotNull(savedOffer);
        assertNotNull(savedOffer.getEmployerEmail());
        assertTrue(savedOffer.getEmployerEmail().equalsIgnoreCase("test@google.com"));
        assertSame(savedOffer.getPublishedDate(), offerPublishDateTime);
        assertNotNull(employerRepository.findByCredentialsEmail("test@google.com"));

        verify(eventPublisher).publishEvent(any(EmployerCreatedInternshipOfferEvent.class));
    }

    @Test
    void createOfferWithMissingInformation_shouldNotSave() {
        Employer employer = buildEmployer();
        EmployerDto employerDto = buildEmployerDto(employer);

        InternshipOfferDto internshipOfferDto = InternshipOfferDto.builder()
                .title("recherche Scratch Developer")
                .description("loremipsum")
                .build();

        when(employerRepository.findByCredentialsEmail(employerDto.getEmail()))
                .thenReturn(Optional.empty());

        //Act/ Assert
        assertThatThrownBy(() -> internshipOfferService.saveInternshipOffer(employer.getEmail(), internshipOfferDto))
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
        assertThat(filteredOffers.getFirst().getTitle()).isEqualTo("recherche Scratch Developer");
        assertThat(filteredOffers.getFirst().getEnterpriseName()).isEqualTo(employer.getEnterpriseName());
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
        internshipOfferService.updateOfferStatus(1L, ApprovalStatus.ACCEPTED, "valid offer");

        // Assert
        assertThat(offer.getStatus()).isEqualTo(ApprovalStatus.ACCEPTED);
        verify(internshipOfferRepository).save(offer);
    }

    @Test
    void updateOfferStatus_shouldThrowWhenOfferIdNotFound() {
        // Arrange
        when(internshipOfferRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> internshipOfferService.updateOfferStatus(99L, ApprovalStatus.ACCEPTED, "offer looks valid :3"))
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
        offer1.setStatus(ApprovalStatus.ACCEPTED);

        InternshipOffer offer2 = buildInternshipOffer(employer, LocalDate.now());
        offer2.setId(2L);
        offer2.setStatus(ApprovalStatus.PENDING);

        InternshipOffer offer3 = buildInternshipOffer(employer, LocalDate.now());
        offer3.setId(3L);
        offer3.setStatus(ApprovalStatus.ACCEPTED);

        when(internshipOfferRepository.findDistinctByStatus(ApprovalStatus.ACCEPTED))
                .thenReturn(List.of(offer1, offer3));

        // Act
        List<InternshipOfferListDto> acceptedOffers = internshipOfferService.getAcceptedOffers();

        // Assert
        assertThat(acceptedOffers).hasSize(2);
        assertThat(acceptedOffers).extracting("title")
                .containsExactlyInAnyOrder(offer1.getTitle(), offer3.getTitle());
    }


    @Test
    void getAcceptedOffers_whenNoAcceptedOffers_shouldReturnEmptyList() {
        // Arrange
        when(internshipOfferRepository.findDistinctByStatus(ApprovalStatus.ACCEPTED))
                .thenReturn(List.of());

        // Act
        List<InternshipOfferListDto> acceptedOffers = internshipOfferService.getAcceptedOffers();

        // Assert
        assertThat(acceptedOffers).isEmpty();
    }


    @Test
    void getPendingOffers_shouldReturnOnlyPendingOffers() {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer1 = buildInternshipOffer(employer, LocalDate.now());
        offer1.setId(1L);
        offer1.setStatus(ApprovalStatus.PENDING);

        InternshipOffer offer2 = buildInternshipOffer(employer, LocalDate.now());
        offer2.setId(2L);
        offer2.setStatus(ApprovalStatus.ACCEPTED);

        InternshipOffer offer3 = buildInternshipOffer(employer, LocalDate.now());
        offer3.setId(3L);
        offer3.setStatus(ApprovalStatus.PENDING);

        when(internshipOfferRepository.findDistinctByStatus(ApprovalStatus.PENDING))
                .thenReturn(List.of(offer1, offer3));

        // Act
        List<InternshipOfferListDto> pendingOffers = internshipOfferService.getPendingOffers();

        // Assert
        assertThat(pendingOffers).hasSize(2);
        assertThat(pendingOffers).extracting("title")
                .containsExactlyInAnyOrder(offer1.getTitle(), offer3.getTitle());
    }

    @Test
    void getPendingOffers_whenNoPendingOffers_shouldReturnEmptyList() {
        // Arrange
        when(internshipOfferRepository.findDistinctByStatus(ApprovalStatus.PENDING))
                .thenReturn(List.of());

        // Act
        List<InternshipOfferListDto> pendingOffers = internshipOfferService.getPendingOffers();

        // Assert
        assertThat(pendingOffers).isEmpty();
    }

    @Test
    void getRejectedOffers_shouldReturnOnlyRefusedOffers() {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer1 = buildInternshipOffer(employer, LocalDate.now());
        offer1.setId(1L);
        offer1.setStatus(ApprovalStatus.REJECTED);

        InternshipOffer offer2 = buildInternshipOffer(employer, LocalDate.now());
        offer2.setId(2L);
        offer2.setStatus(ApprovalStatus.ACCEPTED);

        InternshipOffer offer3 = buildInternshipOffer(employer, LocalDate.now());
        offer3.setId(3L);
        offer3.setStatus(ApprovalStatus.REJECTED);

        when(internshipOfferRepository.findDistinctByStatus(ApprovalStatus.REJECTED))
                .thenReturn(List.of(offer1, offer3));

        // Act
        List<InternshipOfferListDto> refusedOffers = internshipOfferService.getRejectedOffers();

        // Assert
        assertThat(refusedOffers).hasSize(2);
        assertThat(refusedOffers).extracting("title")
                .containsExactlyInAnyOrder(offer1.getTitle(), offer3.getTitle());
    }

    @Test
    void getRejectedOffers_whenNoRefusedOffers_shouldReturnEmptyList() {
        // Arrange
        when(internshipOfferRepository.findDistinctByStatus(ApprovalStatus.REJECTED))
                .thenReturn(List.of());

        // Act
        List<InternshipOfferListDto> refusedOffers = internshipOfferService.getRejectedOffers();

        // Assert
        assertThat(refusedOffers).isEmpty();
    }

    @Test
    void generateInternshipOfferPdfTest_Success() throws IOException {
        // Arrange
        Employer employer = buildEmployer();
        InternshipOffer offer = buildInternshipOffer(employer, LocalDate.now());
        offer.setId(1L);
        offer.setTargetedProgramme("Informatique");
        offer.setExpirationDate(LocalDate.now().plusMonths(1));
        offer.setStatus(ApprovalStatus.ACCEPTED);

        when(internshipOfferRepository.findInternshipOffersById(1L))
                .thenReturn(Optional.of(offer));

        when(employerRepository.findByCredentialsEmail(employer.getEmail()))
                .thenReturn(Optional.of(employer));

        // Act
        byte[] pdfBytes = internshipOfferService.generateInternshipOfferPdf(1L);

        // Assert
        assertNotNull(pdfBytes, "Le PDF généré ne doit pas être null");
        assertTrue(pdfBytes.length > 100, "Le PDF généré doit contenir des octets");
        verify(internshipOfferRepository, times(1)).findInternshipOffersById(1L);
    }

    @Test
    void generateInternshipOfferPdfTest_Failure() {
        // Arrange
        when(internshipOfferRepository.findInternshipOffersById(2L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidInternShipOffer.class, () ->
                internshipOfferService.generateInternshipOfferPdf(2L)
        );

        verify(internshipOfferRepository, times(1)).findInternshipOffersById(2L);
    }

    @Test
    void getAllOffersSummaryFromEmployer_shouldReturnOffersOfEmployer() {
        // Arrange
        Employer employer = spy(buildEmployer());

        InternshipApplication app1 = new InternshipApplication();

        InternshipOffer offer1 = InternshipOffer.builder()
                .id(1L)
                .title("Backend Developer")
                .employer(employer)
                .expirationDate(LocalDate.now().plusDays(30))
                .targetedProgramme("Informatique")
                .reason("Bon profil")
                .applications(new ArrayList<>(List.of(app1)))
                .status(ApprovalStatus.ACCEPTED)
                .build();

        InternshipOffer offer2 = InternshipOffer.builder()
                .id(2L)
                .title("Frontend Developer")
                .employer(employer)
                .expirationDate(LocalDate.now().plusDays(60))
                .targetedProgramme("Design")
                .reason("Bon candidat")
                .applications(new ArrayList<>(List.of(app1)))
                .status(ApprovalStatus.PENDING)
                .build();

        when(employer.getInternshipOffers()).thenReturn(Set.of(offer1, offer2));
        when(employerRepository.findByCredentialsEmail(employer.getEmail()))
                .thenReturn(Optional.of(employer));

        // Act
        List<InternshipOfferListDto> offers =
                internshipOfferService.getAllOffersSummaryFromEmployer(employer.getEmail());

        // Assert
        assertThat(offers).hasSize(2);
        assertThat(offers).extracting("title")
                .containsExactlyInAnyOrder("Backend Developer", "Frontend Developer");

        assertThat(offers.stream()
                .filter(o -> o.getTitle().equals("Backend Developer"))
                .findFirst().get().getApplicationCount()).isEqualTo(1);

        assertThat(offers.stream()
                .filter(o -> o.getTitle().equals("Frontend Developer"))
                .findFirst().get().getApplicationCount()).isEqualTo(1);
    }

    @Test
    void getAllOffersSummaryFromEmployer_whenEmployerNotFound_shouldThrow() {
        // Arrange
        String email = "missing@employer.com";
        when(employerRepository.findByCredentialsEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> internshipOfferService.getAllOffersSummaryFromEmployer(email))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("userNotFound");

        verify(employerRepository).findByCredentialsEmail(email);
    }

    @Test
    void testSessionHiver() {
        LocalDate dateDebut = LocalDate.of(2025, 2, 15);
        String session = service.getIntershipOfferSession(dateDebut);
        assertEquals("Hiver", session);
    }

    @Test
    void testSessionAutomne() {
        LocalDate dateDebut = LocalDate.of(2025, 10, 10);
        String session = service.getIntershipOfferSession(dateDebut);
        assertEquals("Automne", session);
    }

    @Test
    void testSessionEte() {
        LocalDate dateDebut = LocalDate.of(2025, 6, 15);
        String session = service.getIntershipOfferSession(dateDebut);
        assertEquals("Été", session);  // correction du texte attendu
    }

    @Test
    void testDateDebutNull() {
        String session = service.getIntershipOfferSession(null);
        assertEquals("Aucune session (date non définie)", session);
    }

}
