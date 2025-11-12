package org.example.service;

import com.itextpdf.forms.PdfAcroForm;
import com.itextpdf.forms.fields.PdfFormField;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.example.model.Gestionnaire;
import org.example.repository.GestionnaireRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EntenteStageService {

    private static final String TEMPLATE_PATH = "src/main/resources/pdf/contratTemplate.pdf";
    private final GestionnaireRepository gestionnaireRepository;

    public byte[] generateEntenteDeStage(InternshipApplicationResponseDTO dto,
                                         Long gestionnaireId) throws IOException {

        Optional<Gestionnaire> gestionnaire = gestionnaireRepository.findById(gestionnaireId);
        if (gestionnaire.isEmpty()) {
            throw new UserNotFoundException("Gestionnaire not found");
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(new PdfReader(TEMPLATE_PATH), new PdfWriter(outputStream));

        PdfAcroForm form = PdfAcroForm.getAcroForm(pdfDoc, true);
        Map<String, PdfFormField> fields = form.getAllFormFields();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        Map<String, String> values = new HashMap<>();
        values.put("nom_entreprise", safe(dto.getEmployerEnterpriseName()));
        values.put("gestionnaire_firstName", safe(gestionnaire.get().getFirstName()));
        values.put("gestionnaire_lastName", safe(gestionnaire.get().getLastName()));
        values.put("employer_firstName", safe(dto.getEmployerFirstName()));
        values.put("employer_lastName", safe(dto.getEmployerLastName()));
        values.put("etudiant_firstName", safe(dto.getStudentFirstName()));
        values.put("etudiant_lastName", safe(dto.getStudentLastName()));

        values.put("offre_address", safe(dto.getEmployerAddress()));
        values.put("start_date", dto.getStartDate() != null ? dto.getStartDate().format(dateFormatter) : "");
        values.put("end_date", dto.getEndDate() != null ? dto.getEndDate().format(dateFormatter) : "");
        values.put("nb_semaines", computeWeeks(dto));
        values.put("type_horaire", dto.getTypeHoraire() != null ? dto.getTypeHoraire().toString() : "");
        values.put("nb_heures", String.valueOf(dto.getNbHeures()));
        values.put("offre_salary", String.format("%.2f $/h", dto.getSalary()));
        values.put("offre_description", safe(dto.getInternshipOfferDescription()));

        values.put("signature_etudiant", "");
        values.put("signature_employeur", "");
        values.put("signature_gestionnaire", "");
        values.put("date_signature_etudiant", "");
        values.put("date_signature_employeur", "");
        values.put("date_signature_gestionnaire", "");

        values.put("signature_etudiant_firstName", safe(dto.getStudentFirstName()));
        values.put("signature_etudiant_lastName", safe(dto.getStudentLastName()));
        values.put("signature_employeur_firstName", safe(dto.getEmployerFirstName()));
        values.put("signature_employeur_lastName", safe(dto.getEmployerLastName()));
        values.put("signature_gestionnaire_firstName", safe(gestionnaire.get().getFirstName()));
        values.put("signature_gestionnaire_lastName", safe(gestionnaire.get().getLastName()));

        for (Map.Entry<String, String> entry : values.entrySet()) {
            if (fields.containsKey(entry.getKey())) {
                fields.get(entry.getKey()).setValue(entry.getValue());
            }
        }

        form.flattenFields();

        pdfDoc.close();
        return outputStream.toByteArray();
    }

    private String safe(String value) {
        return value != null ? value : "";
    }

    private String computeWeeks(InternshipApplicationResponseDTO dto) {
        if (dto.getStartDate() == null || dto.getEndDate() == null) return "";
        long weeks = java.time.temporal.ChronoUnit.WEEKS.between(dto.getStartDate(), dto.getEndDate());
        return String.valueOf(weeks);
    }
}
