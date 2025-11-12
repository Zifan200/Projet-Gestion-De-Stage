package org.example.service;

import org.example.model.Gestionnaire;
import org.example.repository.GestionnaireRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.mockito.stubbing.OngoingStubbing;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EntenteStageServiceTest {

    @Mock
    private GestionnaireRepository gestionnaireRepository;

    @InjectMocks
    private EntenteStageService ententeStageService;

    private Gestionnaire gestionnaire;
    private InternshipApplicationResponseDTO dto;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Mock d’un gestionnaire
        gestionnaire = new Gestionnaire();
        gestionnaire.setFirstName("Alice");
        gestionnaire.setLastName("Dupont");

        // Mock d’un DTO
        dto = new InternshipApplicationResponseDTO();
        dto.setEmployerEnterpriseName("TechCorp");
        dto.setEmployerFirstName("John");
        dto.setEmployerLastName("Doe");
        dto.setStudentFirstName("Marie");
        dto.setStudentLastName("Durand");
        dto.setEmployerAddress("123 rue de Paris");
        dto.setStartDate(LocalDate.of(2025, 1, 1));
        dto.setEndDate(LocalDate.of(2025, 3, 1));
        dto.setNbHeures(35);
        dto.setSalary(20.5f);
        dto.setInternshipOfferDescription("Développement d'applications Java");
    }

    @Test
    void generateEntenteDeStage_ShouldGeneratePdf_WhenGestionnaireExists() throws IOException {
        OngoingStubbing<Optional<Gestionnaire>> optionalOngoingStubbing =
                when(gestionnaireRepository.findById(1L)).thenReturn(Optional.of(gestionnaire));

        byte[] pdfBytes = ententeStageService.generateEntenteDeStage(dto, 1L);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0, "Le PDF généré ne doit pas être vide");

        verify(gestionnaireRepository, times(1)).findById(1L);
    }

    @Test
    void generateEntenteDeStage_ShouldThrowException_WhenGestionnaireNotFound() {
        when(gestionnaireRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () ->
                ententeStageService.generateEntenteDeStage(dto, 99L)
        );

        verify(gestionnaireRepository, times(1)).findById(99L);
    }

    @Test
    void computeWeeks_ShouldReturnCorrectValue() throws IOException {
        when(gestionnaireRepository.findById(1L)).thenReturn(Optional.of(gestionnaire));

        byte[] pdfBytes = ententeStageService.generateEntenteDeStage(dto, 1L);

        assertNotNull(pdfBytes);
        long expectedWeeks = java.time.temporal.ChronoUnit.WEEKS.between(dto.getStartDate(), dto.getEndDate());
        assertEquals(8, expectedWeeks);
    }
}
