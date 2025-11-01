package org.example.service;

import org.example.model.*;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.*;
import org.example.service.dto.internshipApplication.InternshipApplicationDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.dto.student.EtudiantDTO;
import org.example.service.exception.InvalidApprovalStatus;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
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

    private final String STUDENT_EMAIL = "student@gmail.com";
    private final String EMPLOYER_EMAIL = "employer@gmail.com";

    @Test
    void createInternShipApplication_shouldSaveApplication() {
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
        Etudiant student = Etudiant.builder()
                .email(STUDENT_EMAIL)
                .firstName("firstName")
                .lastName("lastName")
                .password("password")
                .phone("123-456-7890")
                .program("Program")
                .build();
        CV studentCV = CV.builder().id(1L).build();
        InternshipOffer offer = InternshipOffer.builder()
                .id(1L)
                .title("Java Dev")
                .employer(employer)
                .build();
        InternshipApplication application = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(studentCV)
                .offer(offer)
                .build();

        InternshipApplicationDTO applicationDTO = InternshipApplicationDTO.create(application);

        when(employerRepository.findByCredentialsEmail(EMPLOYER_EMAIL)).thenReturn(Optional.of(employer));
        when(studentRepository.findByCredentialsEmail(STUDENT_EMAIL)).thenReturn(Optional.of(student));
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
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
        Etudiant student = Etudiant.builder()
                .email(STUDENT_EMAIL)
                .firstName("firstName")
                .lastName("lastName")
                .password("password")
                .phone("123-456-7890")
                .program("Program")
                .build();
        CV studentCV = CV.builder().id(1L).build();
        InternshipOffer offer = InternshipOffer.builder().id(1L).title("Java Dev").employer(employer).build();
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
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
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
                .employer(employer)
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
        String employerEmail = "emplyer@rmail.com";
        String status = "PENDING";
        Employer employer = Employer.builder()
                .id(1L).email(employerEmail).
                build();

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
                .employer(employer)
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
    void getAllApplicationsFromOffer_shouldReturnApplicationsForGivenOfferId() {
        // Arrange
        Long offerId = 1L;
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
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
                .employer(employer)
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
        when(internshipApplicationRepository.findAllByOfferId(offerId)).thenReturn(List.of(app1, app2));

        // Act
        List<InternshipApplicationResponseDTO> result = internshipApplicationService.getAllApplicationsFromOfferId(offerId);

        // Assert
        assertNotNull(result, "Result should not be null");
        assertEquals(2, result.size(), "Should return two applications for the offer");

        assertEquals(app1.getId(), result.get(0).getId(), "First application ID should match");
        assertEquals(app2.getId(), result.get(1).getId(), "Second application ID should match");
    }

    @Test
    void getAllApplicationsFromOffer_whenOfferIdDoesNotExist_shouldThrowException() {
        // Arrange
        Long offerId = 999L;
        when(internshipOfferRepository.findById(offerId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllApplicationsFromOfferId(offerId));
    }

    @Test
    void getAllApplicationsFromOfferWithStatus_shouldReturnApplicationsForOfferIdWithGivenStatus() {
        // Arrange
        Long offerId = 1L;
        String status = "PENDING";

        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();

        CV cv = CV.builder().id(1L).build();
        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();
        InternshipOffer offer = InternshipOffer.builder().id(1L).title("Java Dev").employer(employer).build();

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
    void getAllApplicationsFromOfferIdWithStatus_whenInvalidStatus_shouldThrowInvalidApprovalStatus() {
        // Arrange
        Long offerId = 1L;
        String invalidStatus = "INVALID_STATUS";

        // Act & Assert
        assertThrows(InvalidApprovalStatus.class,
                () -> internshipApplicationService.getAllApplicationsFromOfferWithStatus(offerId, invalidStatus));
    }

    @Test
    void getAllApplicationsFromOfferWithStatus_whenOfferIdDoesNotExist_shouldThrowException() {
        // Arrange
        Long offerId = 999L;
        String status = "PENDING";

        when(internshipOfferRepository.findById(offerId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllApplicationsFromOfferWithStatus(offerId, status));
    }

    @Test
    void getAllApplicationsFromEmployer_shouldReturnApplicationsForEmployer() {
        // Arrange
        String employerEmail = "employer@test.com";
        Employer employer = Employer.builder().email(employerEmail).build();

        CV cv = CV.builder().id(1L).build();
        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();
        InternshipOffer offer = InternshipOffer.builder().id(1L).title("Java Dev").employer(employer).build();

        InternshipApplication app1 = InternshipApplication.builder().id(1L).student(student).selectedStudentCV(cv).offer(offer).build();
        InternshipApplication app2 = InternshipApplication.builder().id(2L).student(student).selectedStudentCV(cv).offer(offer).build();

        when(employerRepository.findByCredentialsEmail(employerEmail)).thenReturn(Optional.of(employer));
        when(internshipApplicationRepository.getAllByOfferEmployerCredentialsEmail(employerEmail))
                .thenReturn(List.of(app1, app2));

        // Act
        List<InternshipApplicationResponseDTO> result =
                internshipApplicationService.getAllApplicationsFromEmployer(employerEmail);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(app1.getId(), result.get(0).getId());
        assertEquals(app2.getId(), result.get(1).getId());
    }

    @Test
    void getAllApplicationsFromEmployer_whenEmployerDoesNotExist_shouldThrowException() {
        // Arrange
        String invalidEmail = "nonexistent@company.com";
        when(employerRepository.findByCredentialsEmail(invalidEmail)).thenReturn(Optional.empty());

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllApplicationsFromEmployer(invalidEmail)
        );

        assertTrue(exception.getMessage().contains("employer does not exist"));
    }

    @Test
    void getAllApplicationsFromOfferFromEmployer_shouldReturnApplicationsForOfferIdAndEmployer() {
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
        when(internshipApplicationRepository.getAllByOfferEmployerCredentialsEmail(employerEmail))
                .thenReturn(List.of(app1, app2));

        // Act
        List<InternshipApplicationResponseDTO> result =
                internshipApplicationService.getAllApplicationsFromOfferFromEmployer(offerId, employerEmail);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(app1.getId(), result.get(0).getId());
        assertEquals(app1.getOffer().getId(), result.get(0).getInternshipOfferId());
        assertEquals(app2.getId(), result.get(1).getId());
        assertEquals(app2.getOffer().getId(), result.get(1).getInternshipOfferId());

    }

    @Test
    void getAllApplicationsFromOfferFromEmployer_whenEmployerDoesNotExist_shouldThrowExceptionId() {
        // Arrange
        String invalidEmail = "nonexistent@company.com";
        Long offerId = 1L;
        when(employerRepository.findByCredentialsEmail(invalidEmail)).thenReturn(Optional.empty());
        when(internshipOfferRepository.findById(offerId)).thenReturn(Optional.of(new InternshipOffer()));

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllApplicationsFromOfferFromEmployer(offerId, invalidEmail)
        );

        assertTrue(exception.getMessage().contains("employer does not exist"));
    }

    @Test
    void getAllApplicationsFromOfferFromEmployer_whenOfferIdDoesNotExist_shouldThrowException() {
        // Arrange
        String email = "employer@example.com";
        Long invalidOfferId = 999L;
        when(employerRepository.findByCredentialsEmail(email)).thenReturn(Optional.of(new Employer()));
        when(internshipOfferRepository.findById(invalidOfferId)).thenReturn(Optional.empty());

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllApplicationsFromOfferFromEmployer(invalidOfferId, email)
        );

        assertTrue(exception.getMessage().contains("offer does not exist"));
    }

    @Test
    void getApplicationByEmployerAndId_shouldReturnApplicationResponseDTO() {
        //Arrange
        String employerEmail = "employer@test.com";
        Long offerId = 1L;
        Long id = 1L;

        Employer employer = Employer.builder().email(employerEmail).build();
        InternshipOffer offer = InternshipOffer.builder().id(offerId).employer(employer).build();

        CV cv = CV.builder().id(1L).build();
        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();

        InternshipApplication application = InternshipApplication.builder().id(1L).student(student).selectedStudentCV(cv).offer(offer).build();
        when(employerRepository.findByCredentialsEmail(employerEmail)).thenReturn(Optional.of(employer));


        when(internshipApplicationRepository.findById(id)).thenReturn(Optional.of(application));

        // Act
        InternshipApplicationResponseDTO response = internshipApplicationService.getApplicationByEmployerAndId(employerEmail, id);

        // When
        assertNotNull(response);
        assertEquals(id, response.getId());
    }

    @Test
    void getApplicationByEmployerAndId_shouldThrowException_whenEmployerNotFound() {
        // given
        String email = "unknown@email.com";
        Long id = 1L;
        when(employerRepository.findByCredentialsEmail(email)).thenReturn(Optional.empty());

        // when + then
        assertThrows(InvalidInternshipApplicationException.class, () ->
                internshipApplicationService.getApplicationByEmployerAndId(email, id)
        );
    }

    @Test
    void getApplicationByEmployerAndId_shouldThrowException_whenApplicationNotFound() {
        // given
        String email = "employer@email.com";
        Long id = 1L;

        Employer employer = new Employer();
        when(employerRepository.findByCredentialsEmail(email)).thenReturn(Optional.of(employer));
        when(internshipApplicationRepository.findById(id)).thenReturn(Optional.empty());

        // when + then
        assertThrows(InvalidInternshipApplicationException.class, () ->
                internshipApplicationService.getApplicationByEmployerAndId(email, id)
        );
    }

    @Test
    void getApplicationByStudentAndId_ShouldReturnInternshipApplicationResponseDTO() {
        //Arrange
        String employerEmail = "some.employer@company.com";
        Long id = 1L;

        Employer employer = Employer.builder().email(employerEmail).build();
        InternshipOffer offer = InternshipOffer.builder().id(id).employer(employer).build();

        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();
        CV cv = CV.builder().id(id).build();

        InternshipApplication application = InternshipApplication.builder()
                .id(id)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .build();

        when(studentRepository.findByCredentialsEmail(STUDENT_EMAIL))
                .thenReturn(Optional.of(student));

        when(internshipApplicationRepository.findById(id))
                .thenReturn(Optional.of(application));

        // Act
        InternshipApplicationResponseDTO response =
                internshipApplicationService.getApplicationByStudentAndId(STUDENT_EMAIL, id);

        // Assert
        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals(STUDENT_EMAIL, response.getStudentEmail());
        assertEquals(offer.getTitle(), response.getInternshipOfferTitle());
        assertEquals(employerEmail, response.getEmployerEmail());
    }

    @Test
    void getApplicationByStudentAndId_shouldThrowException_whenApplicationDoesNotExist() {
        // Arrange
        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();

        // Act + Assert
        assertThrows(
                InvalidInternshipApplicationException.class, () ->
                internshipApplicationService.getApplicationByStudentAndId(
                        student.getEmail(),
                        1L
                )
        );
    }

    @Test
    void getApplicationByStudentAndId_shouldThrowException_whenStudentNotFound() {
        // Arrange
        String employerEmail = "some.employer@company.com";
        Long id = 1L;

        Employer employer = Employer.builder().email(employerEmail).build();
        InternshipOffer offer = InternshipOffer.builder().id(id).employer(employer).build();

        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();
        CV cv = CV.builder().id(id).build();

        InternshipApplication application = InternshipApplication.builder()
                .id(id)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .build();

        when(studentRepository.findByCredentialsEmail("notfound@email.com"))
                .thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(
                InvalidInternshipApplicationException.class, () ->
                        internshipApplicationService.getApplicationByStudentAndId(
                                "notfound@email.com",
                                application.getId()
                        )
        );
    }

    @Test
    void getAllStudentsThatHasAppliedToInternship_shouldReturnStudentsWithApplications() {
        // Arrange
        Etudiant student = Etudiant.builder()
                .id(1L)
                .firstName("Jimmy")
                .lastName("Junior")
                .email("jimmyJunior@gmail.com")
                .phone("514-123-4567")
                .adresse("123 Rue Test")
                .program("Informatique")
                .since(LocalDate.now())
                .build();

        when(studentRepository.findByApplicationsIsNotEmpty())
                .thenReturn(List.of(student));

        // Act
        List<EtudiantDTO> students = internshipApplicationService.getAllStudentsWithApplication();

        // Assert
        assertThat(students)
                .isNotEmpty()
                .hasSize(1);

        EtudiantDTO dto = students.get(0);
        assertEquals("jimmyJunior@gmail.com", dto.getEmail());
        assertEquals("Informatique", dto.getProgram());
        assertEquals("Jimmy", dto.getFirstName());
    }

    @Test
    void getAllStudentsThatHasAppliedToInternship_shouldReturnEmptyList_whenNoStudentsHaveApplications() {
        // Arrange
        when(studentRepository.findByApplicationsIsNotEmpty())
                .thenReturn(Collections.emptyList());

        // Act
        List<EtudiantDTO> result = internshipApplicationService.getAllStudentsWithApplication();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void getAllApplicationsFromStudent_shouldReturnApplicationsForStudent() {
        // Arrange
        String employerEmail = "emile.ployer@corp.com";
        Employer employer = Employer.builder().email(employerEmail).build();

        CV cv = CV.builder().id(1L).build();
        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();

        InternshipOffer offer1 = InternshipOffer.builder()
                .id(1L)
                .title("Frontend Angular")
                .employer(employer)
                .build();
        InternshipOffer offer2 = InternshipOffer.builder()
                .id(2L)
                .title("Développeur Fullstack")
                .employer(employer)
                .build();

        InternshipApplication app1 = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer1)
                .build();
        InternshipApplication app2 = InternshipApplication.builder()
                .id(2L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer2)
                .build();

        when(studentRepository.findByCredentialsEmail(STUDENT_EMAIL))
                .thenReturn(Optional.of(student));
        when(internshipApplicationRepository.findAllByStudentCredentialsEmail(STUDENT_EMAIL))
                .thenReturn(List.of(app1, app2));

        // Act
        List<InternshipApplicationResponseDTO> list =
                internshipApplicationService.getAllApplicationsFromStudent(STUDENT_EMAIL);

        // Assert
        assertNotNull(list);
        assertEquals(2, list.size());
        assertEquals("Frontend Angular", list.get(0).getInternshipOfferTitle());
        assertEquals("Développeur Fullstack", list.get(1).getInternshipOfferTitle());
    }

    @Test
    void getAllApplicationsFromStudent_whenStudentDoesNotExist_shouldThrowException() {
        // Arrange
        String invalidEmail = "student@notfound.com";
        when(studentRepository.findByCredentialsEmail(invalidEmail)).thenReturn(Optional.empty());

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.getAllApplicationsFromStudent(invalidEmail)
        );

        assertTrue(exception.getMessage().contains("student does not exist"));
    }

    @Test
    void getAllApplicationsFromStudent_shouldReturnEmptyList_whenNoApplications() {
        // Arrange
        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();

        when(studentRepository.findByCredentialsEmail(STUDENT_EMAIL))
                .thenReturn(Optional.of(student));
        when(internshipApplicationRepository.findAllByStudentCredentialsEmail(STUDENT_EMAIL))
                .thenReturn(List.of());

        // Act
        List<InternshipApplicationResponseDTO> list =
                internshipApplicationService.getAllApplicationsFromStudent(STUDENT_EMAIL);

        // Assert
        assertNotNull(list);
        assertEquals(0, list.size());
    }

    @Test
    void getAllApplicationsFromStudentByStatus_shouldReturnApplicationsWithStatus() {
        // Arrange
        String status = "ACCEPTED";

        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
        InternshipOffer offer = InternshipOffer.builder()
                .id(1L)
                .title("Frontend React")
                .employer(employer)
                .build();

        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();
        CV cv = CV.builder().id(1L).build();

        InternshipApplication application = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .status(ApprovalStatus.ACCEPTED)
                .build();

        when(studentRepository.findByCredentialsEmail(STUDENT_EMAIL)).thenReturn(Optional.of(student));

        when(internshipApplicationRepository.findAllByStudentCredentialsEmailAndStatus(
                STUDENT_EMAIL, ApprovalStatus.ACCEPTED
        )).thenReturn(List.of(application));

        // Act
        List<InternshipApplicationResponseDTO> res =
                internshipApplicationService.getAllApplicationsFromStudentByStatus(STUDENT_EMAIL, status);

        // Assert
        assertNotNull(res);
        assertEquals(1, res.size());
        assertEquals(application.getId(), res.get(0).getId());
        assertEquals(ApprovalStatus.ACCEPTED, res.get(0).getStatus());
    }

    @Test
    void getAllApplicationsFromStudentByStatus_shouldThrowException_whenInvalidStatus() {
        // Arrange
        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();

        when(studentRepository.findByCredentialsEmail(STUDENT_EMAIL))
                .thenReturn(Optional.of(student));

        // Act & Assert
        assertThrows(InvalidApprovalStatus.class,
                () -> internshipApplicationService.getAllApplicationsFromStudentByStatus(
                        STUDENT_EMAIL, "INVALID"
                ));
    }

    @Test
    void getAllApplicationsFromStudentByStatus_shouldReturnEmptyList_whenNoApplications() {
        // Arrange
        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();

        when(studentRepository.findByCredentialsEmail(STUDENT_EMAIL))
                .thenReturn(Optional.of(student));

        // Act
        List<InternshipApplicationResponseDTO> list =
                internshipApplicationService.getAllApplicationsFromStudentByStatus(STUDENT_EMAIL, "PENDING");

        // Assert
        assertNotNull(list);
        assertEquals(0, list.size());
    }

    @Test
    void approveInternshipApplication_shouldReturnUpdatedApplication() {
        // Arrange
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
        InternshipOffer offer = InternshipOffer.builder()
                .id(1L)
                .title("Frontend React")
                .employer(employer)
                .build();

        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();
        CV cv = CV.builder().id(1L).build();

        InternshipApplication pendingApp = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .build();
        InternshipApplicationResponseDTO pendingRes = InternshipApplicationResponseDTO.create(pendingApp);

        when(employerRepository.findByCredentialsEmail(EMPLOYER_EMAIL)).thenReturn(Optional.of(employer));
        when(internshipApplicationRepository.findById(pendingRes.getId())).thenReturn(Optional.of(pendingApp));

        // Act
        InternshipApplicationResponseDTO result =
                internshipApplicationService.approveInternshipApplication(EMPLOYER_EMAIL, pendingRes.getId());

        // Assert
        assertNotNull(result);
        assertEquals(ApprovalStatus.ACCEPTED, result.getStatus());
    }

    @Test
    void approveInternshipApplication_shouldThrow_whenApplicationNotFound() {
        // Arrange
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
        when(employerRepository.findByCredentialsEmail(EMPLOYER_EMAIL)).thenReturn(Optional.of(employer));

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.approveInternshipApplication(EMPLOYER_EMAIL, 1L)
        );
    }

    @Test
    void approveInternshipApplication_shouldThrow_whenEmployerNotFound() {
        // Arrange
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
        when(employerRepository.findByCredentialsEmail(EMPLOYER_EMAIL)).thenReturn(Optional.of(employer));

        InternshipOffer offer = InternshipOffer.builder()
                .id(1L)
                .title("Frontend React")
                .employer(employer)
                .build();

        InternshipApplicationResponseDTO application = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail(STUDENT_EMAIL)
                .employerEmail("wrong@test.com")
                .internshipOfferId(offer.getId())
                .internshipOfferTitle(offer.getTitle())
                .build();

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.approveInternshipApplication(EMPLOYER_EMAIL, application.getId())
        );
    }

    @Test
    void rejectInternshipApplication_shouldReturnUpdatedApplication() {
        // Arrange
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
        InternshipOffer offer = InternshipOffer.builder()
                .id(1L)
                .title("Frontend React")
                .employer(employer)
                .build();

        Etudiant student = Etudiant.builder().email(STUDENT_EMAIL).build();
        CV cv = CV.builder().id(1L).build();

        String reason = "Vous n'avez indiqué aucune compétence en React sur votre CV.";
        InternshipApplication pendingApp = InternshipApplication.builder()
                .id(1L)
                .student(student)
                .selectedStudentCV(cv)
                .offer(offer)
                .build();
        InternshipApplicationResponseDTO pendingRes = InternshipApplicationResponseDTO.create(pendingApp);

        when(employerRepository.findByCredentialsEmail(EMPLOYER_EMAIL)).thenReturn(Optional.of(employer));
        when(internshipApplicationRepository.findById(pendingRes.getId())).thenReturn(Optional.of(pendingApp));

        // Act
        InternshipApplicationResponseDTO result =
                internshipApplicationService.rejectInternshipApplication(EMPLOYER_EMAIL, pendingRes.getId(), reason);

        // Assert
        assertNotNull(result);
        assertEquals(ApprovalStatus.REJECTED, result.getStatus());
        assertEquals(reason, result.getReason());
    }

    @Test
    void rejectInternshipApplication_shouldThrow_whenApplicationNotFound() {
        // Arrange
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
        String reason = "Une raison";

        when(employerRepository.findByCredentialsEmail(EMPLOYER_EMAIL)).thenReturn(Optional.of(employer));

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.rejectInternshipApplication(EMPLOYER_EMAIL, 1L, reason)
        );
    }

    @Test
    void rejectInternshipApplication_shouldThrow_whenEmployerNotFound() {
        // Arrange
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
        when(employerRepository.findByCredentialsEmail(EMPLOYER_EMAIL)).thenReturn(Optional.of(employer));

        InternshipOffer offer = InternshipOffer.builder()
                .id(1L)
                .title("Frontend React")
                .employer(employer)
                .build();

        String reason = "Une raison quelconque";
        InternshipApplicationResponseDTO app = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail(STUDENT_EMAIL)
                .employerEmail("wrong@test.com")
                .internshipOfferId(offer.getId())
                .internshipOfferTitle(offer.getTitle())
                .build();

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService.rejectInternshipApplication(EMPLOYER_EMAIL, app.getId(), reason)
        );
    }

    @Test
    void rejectInternshipApplication_shouldThrow_whenMissingReason() {
        // Arrange
        Employer employer = Employer.builder().id(1L).email(EMPLOYER_EMAIL).build();
        when(employerRepository.findByCredentialsEmail(EMPLOYER_EMAIL)).thenReturn(Optional.of(employer));

        InternshipOffer offer = InternshipOffer.builder()
                .id(1L)
                .title("Frontend React")
                .employer(employer)
                .build();

        InternshipApplicationResponseDTO app = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail(STUDENT_EMAIL)
                .employerEmail(EMPLOYER_EMAIL)
                .internshipOfferId(offer.getId())
                .internshipOfferTitle(offer.getTitle())
                .build();

        // Act & Assert
        InvalidInternshipApplicationException exception = assertThrows(
                InvalidInternshipApplicationException.class,
                () -> internshipApplicationService
                        .rejectInternshipApplication(EMPLOYER_EMAIL, app.getId(), null)
        );
    }
}




