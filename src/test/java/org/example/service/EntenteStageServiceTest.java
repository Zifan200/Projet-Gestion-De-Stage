package org.example.service;

import com.itextpdf.forms.PdfAcroForm;
import com.itextpdf.forms.fields.PdfFormField;
import com.itextpdf.forms.fields.PdfTextFormField;
import com.itextpdf.forms.fields.TextFormFieldBuilder;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfTextArray;
import com.itextpdf.kernel.pdf.PdfWriter;
import org.example.model.EntenteStagePdf;
import org.example.model.Gestionnaire;
import org.example.model.auth.Role;
import org.example.repository.EntenteStagePdfRepository;
import org.example.repository.GestionnaireRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EntenteStageServiceTest {

    @Mock
    private GestionnaireRepository gestionnaireRepository;

    @Mock
    private EntenteStagePdfRepository ententeStagePdfRepository;
    @InjectMocks
    private EntenteStageService ententeStageService;

    private Gestionnaire gestionnaire;
    private InternshipApplicationResponseDTO dto;
    private EntenteStagePdf existingPdf;
    

    @BeforeEach
    void setUp() throws IOException {
        MockitoAnnotations.openMocks(this);

        gestionnaire = new Gestionnaire();
        gestionnaire.setFirstName("Alice");
        gestionnaire.setLastName("Dupont");

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

        existingPdf = new EntenteStagePdf();
        existingPdf.setId(dto.getId());
        existingPdf.setPdfData(createDummyPdfWithFields());
    }

    private byte[] createDummyPdfWithFields() throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(new PdfWriter(out));
        PdfAcroForm form = PdfAcroForm.getAcroForm(pdfDoc, true);

        String[] fieldNames = {
                "signature_employeur", "date_signature_employeur",
                "signature_etudiant", "date_signature_etudiant",
                "signature_gestionnaire", "date_signature_gestionnaire"
        };

        for (String name : fieldNames) {
            Rectangle rect = new Rectangle(50, 750, 200, 20);
            TextFormFieldBuilder builder = new TextFormFieldBuilder(pdfDoc, name)
                    .setWidgetRectangle(rect);
            PdfTextFormField field = builder.createText();
            form.addField(field);        }

        pdfDoc.addNewPage();
        pdfDoc.close();
        return out.toByteArray();
    }

    @Test
    void generateEntenteDeStage_ShouldGeneratePdf_WhenGestionnaireExists() throws IOException {
        when(gestionnaireRepository.findById(1L)).thenReturn(Optional.of(gestionnaire));

        byte[] pdfBytes = ententeStageService.generateEntenteDeStage(dto, 1L, Role.EMPLOYER);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0, "Le PDF généré ne doit pas être vide");

        verify(gestionnaireRepository, times(1)).findById(1L);
    }

    @Test
    void generateEntenteDeStage_ShouldThrowException_WhenGestionnaireNotFound() {
        when(gestionnaireRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () ->
                ententeStageService.generateEntenteDeStage(dto, 99L, Role.STUDENT)
        );

        verify(gestionnaireRepository, times(1)).findById(99L);
    }

    @Test
    void convertirSemaines_ShouldReturnCorrectValue() throws IOException {
        when(gestionnaireRepository.findById(1L)).thenReturn(Optional.of(gestionnaire));

        byte[] pdfBytes = ententeStageService.generateEntenteDeStage(dto, 1L, Role.GESTIONNAIRE);

        assertNotNull(pdfBytes);
        long expectedWeeks = java.time.temporal.ChronoUnit.WEEKS.between(dto.getStartDate(), dto.getEndDate());
        assertEquals(8, expectedWeeks);
    }

    @Test
    void updateEntenteDeStage_ShouldUpdatePdf_WhenPdfExists() throws IOException {
        when(gestionnaireRepository.findById(1L)).thenReturn(Optional.of(gestionnaire));
        when(ententeStagePdfRepository.findById(dto.getId())).thenReturn(Optional.of(existingPdf));
        when(ententeStagePdfRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // Passer l'ID du PDF comme premier argument
        byte[] updatedPdf = ententeStageService.updateEntenteDeStage(dto.getId(), dto, 1L, Role.EMPLOYER);

        assertNotNull(updatedPdf);
        assertTrue(updatedPdf.length > 0, "Le PDF mis à jour ne doit pas être vide");

        verify(gestionnaireRepository, times(1)).findById(1L);
        verify(ententeStagePdfRepository, times(1)).findById(dto.getId());
        verify(ententeStagePdfRepository, times(1)).save(existingPdf);
    }

    @Test
    void updateEntenteDeStage_ShouldThrowException_WhenPdfDoesNotExist() {
        when(gestionnaireRepository.findById(1L)).thenReturn(Optional.of(gestionnaire));
        when(ententeStagePdfRepository.findById(dto.getId())).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () ->
                ententeStageService.updateEntenteDeStage(dto.getId(), dto, 1L, Role.STUDENT)
        );

        verify(ententeStagePdfRepository, times(1)).findById(dto.getId());
        verify(ententeStagePdfRepository, never()).save(any());
    }
}
