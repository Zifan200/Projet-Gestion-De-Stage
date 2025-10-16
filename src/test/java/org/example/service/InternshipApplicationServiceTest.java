package org.example.service;

import org.example.model.CV;
import org.example.model.Etudiant;
import org.example.model.InternshipApplication;
import org.example.model.InternshipOffer;
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
}
