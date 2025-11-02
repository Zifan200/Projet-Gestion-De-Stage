package org.example.service;

import org.example.event.ConvocationCreatedEvent;
import org.example.event.ConvocationStatusChangedEvent;
import org.example.model.*;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.*;
import org.example.service.dto.internshipApplication.ConvocationDTO;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConvocationServiceTest {

    @Mock
    private ConvocationRepository convocationRepository;
    @Mock
    private EmployerRepository employerRepository;
    @Mock
    private EtudiantRepository studentRepository;
    @Mock
    private InternshipApplicationRepository internshipApplicationRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ConvocationService convocationService;

    private Etudiant student;
    private Employer employer;
    private InternshipApplication internshipApplication;

    @BeforeEach
    void setUp() {
        student = Etudiant.builder()
                .id(1L)
                .email("student@test.com")
                .build();


        employer = Employer.builder()
                .id(2L)
                .email("employer@test.com")
                .firstName("Test Firstname")
                .lastName("Test LastName")
                .password("password")
                .since(LocalDate.now())
                .enterpriseName("Test enterprise")
                .build();


        internshipApplication = new InternshipApplication();
        internshipApplication.setId(10L);
        internshipApplication.setStudent(student);
        internshipApplication.setStatus(ApprovalStatus.ACCEPTED);

        internshipApplication.setOffer(new InternshipOffer());
        internshipApplication.getOffer().setEmployer(employer);
    }

    @Test
    void createConvocation_Success() {
        ConvocationDTO dto = ConvocationDTO.builder()
                .studentEmail("student@test.com")
                .employerEmail("employer@test.com")
                .convocationDate(LocalDateTime.now())
                .status(ApprovalStatus.PENDING)
                .internshipApplicationId(10L)
                .build();

        when(studentRepository.findByCredentialsEmail("student@test.com")).thenReturn(Optional.of(student));
        when(employerRepository.findByCredentialsEmail("employer@test.com")).thenReturn(Optional.of(employer));
        when(internshipApplicationRepository.findById(10L)).thenReturn(Optional.of(internshipApplication));

        when(convocationRepository.save(any())).thenAnswer(invocation -> {
            Convocation conv = invocation.getArgument(0);
            conv.setId(100L);
            conv.setEtudiant(student);
            conv.setEmployer(employer);
            conv.setInternshipApplication(internshipApplication);
            return conv;
        });

        ConvocationDTO result = convocationService.createConvocation(dto);

        assertNotNull(result);
        assertEquals("student@test.com", result.getStudentEmail());
        assertEquals("employer@test.com", result.getEmployerEmail());
        assertEquals(10L, result.getInternshipApplicationId());
        verify(convocationRepository, times(1)).save(any());
        verify(eventPublisher, times(1)).publishEvent(any(ConvocationCreatedEvent.class));
    }

    @Test
    void createConvocation_Throws_WhenStudentNotFound() {
        ConvocationDTO dto = ConvocationDTO.builder()
                .studentEmail("missing@test.com")
                .employerEmail("employer@test.com")
                .internshipApplicationId(1L)
                .build();

        when(studentRepository.findByCredentialsEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThrows(InvalidInternshipApplicationException.class, () -> convocationService.createConvocation(dto));
    }

    @Test
    void updateConvocationStatus_Success() {
        Convocation convocation = Convocation.builder()
                .id(1L)
                .etudiant(student)
                .employer(employer)
                .status(ApprovalStatus.PENDING)
                .internshipApplication(internshipApplication)
                .build();

        when(convocationRepository.findById(1L)).thenReturn(Optional.of(convocation));
        when(convocationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ConvocationDTO updated = convocationService.updateConvocationStatus(1L,
                "student@test.com", ApprovalStatus.ACCEPTED);

        assertEquals(ApprovalStatus.ACCEPTED, updated.getStatus());
        verify(convocationRepository, times(1)).save(convocation);
        verify(eventPublisher, times(1)).publishEvent(any(ConvocationStatusChangedEvent.class));

    }

    @Test
    void updateConvocationStatus_Throws_WhenConvocationNotPending() {
        Convocation convocation = Convocation.builder()
                .id(1L)
                .etudiant(student)
                .employer(employer)
                .status(ApprovalStatus.ACCEPTED)
                .internshipApplication(internshipApplication)
                .build();

        when(convocationRepository.findById(1L)).thenReturn(Optional.of(convocation));

        assertThrows(InvalidInternshipApplicationException.class,
                () -> convocationService.updateConvocationStatus(1L, "student@test.com",
                        ApprovalStatus.REJECTED));
    }

    @Test
    void updateConvocationStatus_Throws_WhenStudentMismatch() {
        Etudiant otherStudent = Etudiant.builder().id(2L).email("other@test.com").build();
        Convocation convocation = Convocation.builder()
                .id(1L)
                .etudiant(otherStudent)
                .status(ApprovalStatus.PENDING)
                .build();

        when(convocationRepository.findById(1L)).thenReturn(Optional.of(convocation));

        assertThrows(InvalidInternshipApplicationException.class,
                () -> convocationService.updateConvocationStatus(1L, "student@test.com",
                        ApprovalStatus.ACCEPTED));
    }
}
