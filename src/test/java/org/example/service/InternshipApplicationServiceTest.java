package org.example.service;

import org.example.model.CV;
import org.example.model.Etudiant;
import org.example.model.InternshipApplication;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.*;
import org.example.service.dto.InternshipApplication.InternshipApplicationDTO;
import org.example.service.dto.InternshipApplication.InternshipApplicationResponseDTO;
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
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private InternshipOfferRepository internshipOfferRepository;
    @InjectMocks
    private StudentService studentService;
    @InjectMocks
    private InternshipApplicationService internshipApplicationService ;

    private String STUDENT_EMAIL = "student@gmail.com";


    @Test
    void createInternShipApplication_shouldSaveApplication(){
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
    void createInternShipApplicationWithWrongValues_shouldNOTSaveApplication(){
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
        var result = internshipApplicationService.getAllApplicationWithStatus(status);

        // Assert
        assertNotNull(result, "Result should not be null");
        assertEquals(1, result.size(), "Should return one application with the given status");

        var response = result.get(0);
        assertEquals(app.getId(), response.getId(), "Application ID should match");
        assertEquals(STUDENT_EMAIL, response.getStudentEmail(), "Student email should match");
        assertEquals(ApprovalStatus.PENDING, response.getStatus(), "Status should match 'PENDING'");

    }


}
