package org.example.service;

import org.example.model.*;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.*;
import org.example.service.dto.InternshipApplication.InternshipApplicationDTO;
import org.example.service.dto.InternshipApplication.InternshipApplicationResponseDTO;
import org.example.service.exception.InvalidApprovalStatus;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class InternshipApplicationServiceTest {

    @Mock
    private EtudiantRepository studentRepository;

    @Mock
    private CvRepository cvRepository;
    @Mock
    private InternshipApplicationRepository internshipApplicationRepository;
    @Mock
    private EmployerRepository employerRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private InternshipOfferRepository internshipOfferRepository;
    @InjectMocks
    private StudentService studentService;
    @InjectMocks
    private InternshipApplicationService internshipApplicationService;

    private String STUDENT_EMAIL = "student@gmail.com";


    @Test
    void createInternShipApplication_shouldSaveApplication() {
        Etudiant student = Etudiant.builder()
                .email(STUDENT_EMAIL)
                .firstName("firstName")
                .lastName("lastName")
                .password("password")
                .phone("123-456-7890")
                .program("Program")
                .build();
        CV studentCV = CV.builder().id(1L).build();
        InternshipOffer offer = InternshipOffer.builder().id(1L).title("JAva Dev").build();
        InternshipApplication application = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(studentCV)
                .offer(offer)
                .build();

        InternshipApplicationDTO applicationDTO = InternshipApplicationDTO.create(application);

        when(studentRepository.findByCredentialsEmail(STUDENT_EMAIL)).thenReturn(Optional.ofNullable(student));
        when(cvRepository.findById(1L)).thenReturn(Optional.of(studentCV));
        when(internshipOfferRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(internshipApplicationRepository.save(any(InternshipApplication.class)))
                .thenReturn(application);

        // Act
        InternshipApplicationResponseDTO response = internshipApplicationService.saveInternshipApplication(
                applicationDTO
        );

        // Assert
        assertNotNull(response, "Response should not be null");
        assertEquals(1L, response.getId(), "Saved application ID should be 1");
        assertEquals(STUDENT_EMAIL, response.getStudentEmail(), "Student email should match");
        assertEquals(studentCV.getId(), response.getSelectedCvID(), "Selected CV ID should match");
        assertEquals(offer.getId(), response.getInternshipOfferId(), "Internship offer ID should match");
        assertEquals(application.getStatus(), response.getStatus(), "Status should match the application");
    }


    @Test
    void createInternShipApplicationWithWrongValues_shouldNOTSaveApplication() {
        Etudiant student = Etudiant.builder()
                .email(STUDENT_EMAIL)
                .firstName("firstName")
                .lastName("lastName")
                .password("password")
                .phone("123-456-7890")
                .program("Program")
                .build();
        CV studentCV = CV.builder().id(1L).build();
        InternshipOffer offer = InternshipOffer.builder().id(1L).title("JAva Dev").build();
        InternshipApplication application = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(studentCV)
                .offer(offer)
                .build();

        InternshipApplicationDTO applicationDTO = InternshipApplicationDTO.builder()
                .studentEmail(STUDENT_EMAIL)
                .selectedCvID(999L)  // does NOT exist
                .internshipOfferId(888L) // does NOT exist
                .build();

        // Repositories return empty for wrong IDs
        when(studentRepository.findByCredentialsEmail(STUDENT_EMAIL)).thenReturn(Optional.of(student));
        when(cvRepository.findById(999L)).thenReturn(Optional.empty());
        when(internshipOfferRepository.findById(888L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.saveInternshipApplication(applicationDTO)
        );
    }

    @Test
    void getAllInternshipApplications_itReturnListOfSavedInternshipApplication() {
        // Arrange
        Etudiant student = Etudiant.builder()
                .email(STUDENT_EMAIL)
                .firstName("firstName")
                .lastName("lastName")
                .password("password")
                .phone("123-456-7890")
                .program("Program")
                .build();
        CV cv = CV.builder()
                .id(1L)
                .fileName("cv.pdf")
                .fileSize(2000L)
                .build();

        InternshipOffer offer = InternshipOffer.builder()
                .id(1L)
                .title("Java Developer")
                .build();

        InternshipApplication app1 = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .build();

        InternshipApplication app2 = InternshipApplication.builder()
                .id(2L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .build();

        when(internshipApplicationRepository.findAll()).thenReturn(List.of(app1, app2));

        // Act
        var result = internshipApplicationService.getAllApplications();

        // Assert
        assertNotNull(result, "Result list should not be null");
        assertEquals(2, result.size(), "There should be two internship applications returned");

        InternshipApplicationResponseDTO first = result.getFirst();
        assertEquals(app1.getId(), first.getId(), "First application's ID should match");
        assertEquals(STUDENT_EMAIL, first.getStudentEmail(), "Student email should match");
        assertEquals(offer.getId(), first.getInternshipOfferId(), "Offer ID should match");
        assertEquals(cv.getId(), first.getSelectedCvID(), "CV ID should match");
    }

    @Test
    void getAllInternshipApplications_whenRepositoryReturnsEmptyList_shouldReturnEmptyList() {
        // Arrange
        when(internshipApplicationRepository.findAll()).thenReturn(List.of());

        // Act
        var result = internshipApplicationService.getAllApplications();

        // Assert
        assertNotNull(result, "Result should not be null");
        assertTrue(result.isEmpty(), "Result list should be empty when no internship applications are found");
    }

    @Test
    void getAllApplicationWithStatus_itReturnsApplicationsWithGivenStatus() {
        // Arrange
        String status = "PENDING";

        Etudiant student = Etudiant.builder()
                .email(STUDENT_EMAIL)
                .firstName("firstName")
                .lastName("lastName")
                .password("password")
                .phone("123-456-7890")
                .program("Program")
                .build();

        CV cv = CV.builder()
                .id(1L)
                .fileName("cv.pdf")
                .fileSize(1000L)
                .build();

        InternshipOffer offer = InternshipOffer.builder()
                .id(1L)
                .title("Java Developer")
                .build();

        InternshipApplication app = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .status(ApprovalStatus.PENDING)
                .build();

        when(internshipApplicationRepository.findAllByStatus(ApprovalStatus.PENDING))
                .thenReturn(List.of(app));

        // Act
        var result = internshipApplicationService.getAllApplicationsWithStatus(status);
        var response = result.getFirst();

        // Assert
        assertNotNull(result, "Result should not be null");
        assertEquals(1, result.size(), "Should return one application with the given status");

        assertEquals(app.getId(), response.getId(), "Application ID should match");
        assertEquals(STUDENT_EMAIL, response.getStudentEmail(), "Student email should match");
        assertEquals(ApprovalStatus.PENDING, response.getStatus(), "Status should match 'PENDING'");
    }

    @Test
    void getAllApplicationWithStatus_whenInvalidStatus_shouldThrowInvalidApprovalStatus() {
        // Arrange
        String invalidStatus = "NOT_A_VALID_STATUS";

        // Act
        Exception exception = assertThrows(
                InvalidApprovalStatus.class,
                () -> internshipApplicationService.getAllApplicationsWithStatus(invalidStatus)
        );

        // Assert
        assertNotNull(exception, "Exception should not be null");
        assertTrue(exception.getMessage().contains("invalid"),
                "Exception message should indicate an invalid status");

    }

    @Test
    void getAllApplicationsFromOffer_shouldReturnApplicationsForGivenOffer() {
        // Arrange
        Long offerId = 1L;
        Etudiant student = Etudiant.builder()
                .email(STUDENT_EMAIL)
                .firstName("firstName")
                .lastName("lastName")
                .password("password")
                .phone("123-456-7890")
                .program("Program")
                .build();

        CV cv = CV.builder().id(1L).build();

        InternshipOffer offer = InternshipOffer.builder()
                .id(offerId)
                .title("Java Developer")
                .build();

        InternshipApplication app1 = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .build();

        InternshipApplication app2 = InternshipApplication.builder()
                .id(2L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .build();

        when(internshipOfferRepository.findById(offerId)).thenReturn(Optional.of(offer));
        when(internshipApplicationRepository.findAllByOffer(offer)).thenReturn(List.of(app1, app2));

        // Act
        List<InternshipApplicationResponseDTO> result = internshipApplicationService.getAllApplicationsFromOffer(offerId);

        // Assert
        assertNotNull(result, "Result should not be null");
        assertEquals(2, result.size(), "Should return two applications for the offer");

        assertEquals(app1.getId(), result.get(0).getId(), "First application ID should match");
        assertEquals(app2.getId(), result.get(1).getId(), "Second application ID should match");
    }

    @Test
    void getAllApplicationsFromOffer_whenOfferDoesNotExist_shouldThrowException() {
        // Arrange
        Long offerId = 999L;
        when(internshipOfferRepository.findById(offerId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllApplicationsFromOffer(offerId));
    }

    @Test
    void getAllApplicationsFromOfferWithStatus_shouldReturnApplicationsForOfferWithGivenStatus() {
        // Arrange
        Long offerId = 1L;
        String status = "PENDING";

        Etudiant student = Etudiant.builder()
                .email(STUDENT_EMAIL)
                .firstName("firstName")
                .lastName("lastName")
                .password("password")
                .phone("123-456-7890")
                .program("Program")
                .build();

        CV cv = CV.builder().id(1L).build();

        InternshipOffer offer = InternshipOffer.builder()
                .id(offerId)
                .title("Java Developer")
                .build();

        InternshipApplication app = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .status(ApprovalStatus.PENDING)
                .build();

        when(internshipOfferRepository.findById(offerId)).thenReturn(Optional.of(offer));
        when(internshipApplicationRepository.findAllByOfferAndStatus(offer, ApprovalStatus.PENDING))
                .thenReturn(List.of(app));

        // Act
        List<InternshipApplicationResponseDTO> result =
                internshipApplicationService.getAllApplicationsFromOfferWithStatus(offerId, status);

        // Assert
        assertNotNull(result, "Result should not be null");
        assertEquals(1, result.size(), "Should return one application with the given status");

        InternshipApplicationResponseDTO response = result.get(0);
        assertEquals(app.getId(), response.getId(), "Application ID should match");
        assertEquals(ApprovalStatus.PENDING, response.getStatus(), "Status should match 'PENDING'");
    }

    @Test
    void getAllApplicationsFromOfferWithStatus_whenInvalidStatus_shouldThrowInvalidApprovalStatus() {
        // Arrange
        Long offerId = 1L;
        String invalidStatus = "INVALID_STATUS";

        // Act & Assert
        assertThrows(InvalidApprovalStatus.class,
                () -> internshipApplicationService.getAllApplicationsFromOfferWithStatus(offerId, invalidStatus));
    }

    @Test
    void getAllApplicationsFromOfferWithStatus_whenOfferDoesNotExist_shouldThrowException() {
        // Arrange
        Long offerId = 999L;
        String status = "PENDING";

        when(internshipOfferRepository.findById(offerId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllApplicationsFromOfferWithStatus(offerId, status));
    }

    @Test
    void getAllInternshipApplicationsFromEmployer_shouldReturnApplicationsForEmployer() {
        // Arrange
        String employerEmail = "employer@test.com";
        Employer employer = Employer.builder().email(employerEmail).build();

        CV cv = CV.builder().id(1L).build();
        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();
        InternshipOffer offer = InternshipOffer.builder().id(1L).title("Java Dev").employer(employer).build();

        InternshipApplication app1 = InternshipApplication.builder().id(1L).student(student).selectedStudentCV(cv).offer(offer).build();
        InternshipApplication app2 = InternshipApplication.builder().id(2L).student(student).selectedStudentCV(cv).offer(offer).build();

        when(employerRepository.findByCredentialsEmail(employerEmail)).thenReturn(Optional.of(employer));
        when(internshipApplicationRepository.findAllByOffer_EmployerEmail(employerEmail))
                .thenReturn(List.of(app1, app2));

        // Act
        List<InternshipApplicationResponseDTO> result =
                internshipApplicationService.getAllInternshipApplicationsFromEmployer(employerEmail);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(app1.getId(), result.get(0).getId());
        assertEquals(app2.getId(), result.get(1).getId());
    }

    @Test
    void getAllInternshipApplicationsFromEmployer_whenEmployerDoesNotExist_shouldThrowException() {
        // Arrange
        String invalidEmail = "nonexistent@company.com";
        when(employerRepository.findByCredentialsEmail(invalidEmail)).thenReturn(Optional.empty());

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllInternshipApplicationsFromEmployer(invalidEmail)
        );

        assertTrue(exception.getMessage().contains("employer does not exist"));
    }

    @Test
    void getAllInternshipApplicationsFromOfferFromEmployer_shouldReturnApplicationsForOfferAndEmployer() {
        // Arrange
        String employerEmail = "employer@test.com";
        Long offerId = 1L;

        Employer employer = Employer.builder().email(employerEmail).build();
        InternshipOffer offer = InternshipOffer.builder().id(offerId).employer(employer).build();

        CV cv = CV.builder().id(1L).build();
        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();

        InternshipApplication app1 = InternshipApplication.builder().id(1L).student(student).selectedStudentCV(cv).offer(offer).build();
        InternshipApplication app2 = InternshipApplication.builder().id(2L).student(student).selectedStudentCV(cv).offer(offer).build();

        when(employerRepository.findByCredentialsEmail(employerEmail)).thenReturn(Optional.of(employer));
        when(internshipOfferRepository.findById(offerId)).thenReturn(Optional.of(offer));
        when(internshipApplicationRepository.findAllByOffer_EmployerEmail(employerEmail))
                .thenReturn(List.of(app1, app2));

        // Act
        List<InternshipApplicationResponseDTO> result =
                internshipApplicationService.getAllInternshipApplicationsFromOfferFromEmployer(offerId, employerEmail);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(app1.getId(), result.get(0).getId());
        assertEquals(app2.getId(), result.get(1).getId());
    }

    @Test
    void getAllInternshipApplicationsFromOfferFromEmployer_whenEmployerDoesNotExist_shouldThrowException() {
        // Arrange
        String invalidEmail = "nonexistent@company.com";
        Long offerId = 1L;
        when(employerRepository.findByCredentialsEmail(invalidEmail)).thenReturn(Optional.empty());
        when(internshipOfferRepository.findById(offerId)).thenReturn(Optional.of(new InternshipOffer()));

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllInternshipApplicationsFromOfferFromEmployer(offerId, invalidEmail)
        );

        assertTrue(exception.getMessage().contains("employer does not exist"));
    }

    @Test
    void getAllInternshipApplicationsFromOfferFromEmployer_whenOfferDoesNotExist_shouldThrowException() {
        // Arrange
        String email = "employer@example.com";
        Long invalidOfferId = 999L;
        when(employerRepository.findByCredentialsEmail(email)).thenReturn(Optional.of(new Employer()));
        when(internshipOfferRepository.findById(invalidOfferId)).thenReturn(Optional.empty());

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllInternshipApplicationsFromOfferFromEmployer(invalidOfferId, email)
        );

        assertTrue(exception.getMessage().contains("offer does not exist"));
    }

}




