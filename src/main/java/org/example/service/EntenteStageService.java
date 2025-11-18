package org.example.service;

import com.itextpdf.forms.PdfAcroForm;
import com.itextpdf.forms.fields.PdfFormField;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.example.model.EntenteStagePdf;
import org.example.model.Gestionnaire;
import org.example.model.InternshipApplication;
import org.example.model.auth.Role;
import org.example.model.enums.ApprovalStatus;
import org.example.model.enums.PdfStatus;
import org.example.repository.EntenteStagePdfRepository;
import org.example.repository.GestionnaireRepository;
import org.example.repository.InternshipApplicationRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EntenteStageService {

    private static final String TEMPLATE_PATH = "src/main/resources/pdf/contratTemplate.pdf";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private final GestionnaireRepository gestionnaireRepository;
    private final EntenteStagePdfRepository ententeStagePdfRepository;
    private final InternshipApplicationRepository internshipApplicationRepository;


    private Map<String, String> prepareTextFields(InternshipApplicationResponseDTO dto, Gestionnaire gestionnaire) {
        Map<String, String> values = new HashMap<>();
        values.put("nom_entreprise", safe(dto.getEmployerEnterpriseName()));
        values.put("gestionnaire_firstName", safe(gestionnaire.getFirstName()));
        values.put("gestionnaire_lastName", safe(gestionnaire.getLastName()));
        values.put("employer_firstName", safe(dto.getEmployerFirstName()));
        values.put("employer_lastName", safe(dto.getEmployerLastName()));
        values.put("etudiant_firstName", safe(dto.getStudentFirstName()));
        values.put("etudiant_lastName", safe(dto.getStudentLastName()));
        values.put("offre_address", safe(dto.getEmployerAddress()));
        values.put("start_date", dto.getStartDate() != null ? dto.getStartDate().format(DATE_FORMATTER) : "");
        values.put("end_date", dto.getEndDate() != null ? dto.getEndDate().format(DATE_FORMATTER) : "");
        values.put("nb_semaines", convertirSemaines(dto));
        values.put("type_horaire", dto.getTypeHoraire() != null ? dto.getTypeHoraire().toString() : "");
        values.put("nb_heures", String.valueOf(dto.getNbHeures()));
        values.put("offre_salary", String.format("%.2f $/h", dto.getSalary()));
        values.put("offre_description", safe(dto.getInternshipOfferDescription()));

        // Initialisation des signatures
        values.put("signature_etudiant", "Signer ici");
        values.put("signature_employeur", "Signer ici");
        values.put("signature_gestionnaire", "Signer ici");

        values.put("date_signature_etudiant", "");
        values.put("date_signature_employeur", "");
        values.put("date_signature_gestionnaire", "");

        values.put("signature_etudiant_firstName", safe(dto.getStudentFirstName()));
        values.put("signature_etudiant_lastName", safe(dto.getStudentLastName()));
        values.put("signature_employeur_firstName", safe(dto.getEmployerFirstName()));
        values.put("signature_employeur_lastName", safe(dto.getEmployerLastName()));
        values.put("signature_gestionnaire_firstName", safe(gestionnaire.getFirstName()));
        values.put("signature_gestionnaire_lastName", safe(gestionnaire.getLastName()));

        return values;
    }

    @Transactional
    public byte[] generateEntenteDeStage(InternshipApplicationResponseDTO dto,
                                         Long gestionnaireId,
                                         Role roleActuel) throws IOException {

        claimApplication(dto.getId(), gestionnaireId);
        if (dto.getPostInterviewStatus() != ApprovalStatus.ACCEPTED &&
                dto.getEtudiantStatus() != ApprovalStatus.CONFIRMED_BY_STUDENT) {
            throw new InvalidInternshipApplicationException(
                    "Le PDF ne peut être généré que lorsque l'offre est acceptée et confirmée par l'étudiant."
            );
        }

        Optional<Gestionnaire> gestionnaireOpt = gestionnaireRepository.findById(gestionnaireId);
        if (gestionnaireOpt.isEmpty()) {
            throw new UserNotFoundException("Gestionnaire not found");
        }
        Gestionnaire gestionnaire = gestionnaireOpt.get();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(new PdfReader(TEMPLATE_PATH), new PdfWriter(outputStream));

        PdfAcroForm form = PdfAcroForm.getAcroForm(pdfDoc, true);
        Map<String, PdfFormField> fields = form.getAllFormFields();

        Map<String, String> values = prepareTextFields(dto, gestionnaire);
        values.forEach((key, value) -> {
            if (fields.containsKey(key)) {
                fields.get(key).setValue(value);
            }
        });

        fillSignatureDate(fields, roleActuel);
        lockFieldsByRole(fields, roleActuel);

        pdfDoc.close();
        byte[] pdfBytes = outputStream.toByteArray();

        InternshipApplication app = internshipApplicationRepository.findById(dto.getId())
                .orElseThrow();

        EntenteStagePdf pdfEntity = ententeStagePdfRepository.findById(dto.getId())
                .orElseGet(EntenteStagePdf::new);

        pdfEntity.setApplicationId(app.getId());
        pdfEntity.setPdfData(pdfBytes);

        switch (roleActuel) {
            case EMPLOYER -> pdfEntity.setStatus(PdfStatus.EMPLOYER_SIGNED);
            case STUDENT -> pdfEntity.setStatus(PdfStatus.STUDENT_SIGNED);
            case GESTIONNAIRE -> pdfEntity.setStatus(PdfStatus.GESTIONNAIRE_SIGNED);
            default -> pdfEntity.setStatus(PdfStatus.CREATED);
        }

        EntenteStagePdf savedEntente = ententeStagePdfRepository.save(pdfEntity);
        app.setEntenteStagePdfId(savedEntente.getId());
        internshipApplicationRepository.save(app);

        return pdfBytes;
    }

    @Transactional
    public byte[] updateEntenteDeStage(Long id,
                                       InternshipApplicationResponseDTO dto,
                                       Long gestionnaireId,
                                       Role roleActuel,
                                       String signatureActeur) throws IOException {

        if (dto.getPostInterviewStatus() != ApprovalStatus.ACCEPTED &&
                dto.getEtudiantStatus() != ApprovalStatus.CONFIRMED_BY_STUDENT) {
            throw new InvalidInternshipApplicationException(
                    "Le PDF ne peut être généré que lorsque l'offre est acceptée et confirmée par l'étudiant."
            );
        }

        Gestionnaire gestionnaire = gestionnaireRepository.findById(gestionnaireId)
                .orElseThrow(() -> new UserNotFoundException("Gestionnaire not found"));

        EntenteStagePdf pdfEntity = ententeStagePdfRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("PDF avec l'id " + id + " n'existe pas"));

        byte[] existingPdf = pdfEntity.getPdfData();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfDocument pdfDoc = new PdfDocument(
                new PdfReader(new ByteArrayInputStream(existingPdf)),
                new PdfWriter(outputStream)
        );

        PdfAcroForm form = PdfAcroForm.getAcroForm(pdfDoc, true);
        Map<String, PdfFormField> fields = form.getAllFormFields();

        Map<String, String> values = prepareTextFields(dto, gestionnaire);
        // 🔹 Remplacer la valeur de signature_gestionnaire si elle est fournie
        if (roleActuel == Role.GESTIONNAIRE && signatureActeur != null) {
            values.put("signature_gestionnaire", signatureActeur);
        }

        // Remplir les champs
        values.forEach((key, value) -> {
            if (fields.containsKey(key)) {
                fields.get(key).setValue(value);  // on écrase toujours, pas seulement si vide
            }
        });

        fillSignatureDate(fields, roleActuel);
        lockFieldsByRole(fields, roleActuel);

        if (roleActuel == Role.GESTIONNAIRE) {
            form.flattenFields();
        }

        pdfDoc.close();
        byte[] updatedPdf = outputStream.toByteArray();
        pdfEntity.setPdfData(updatedPdf);

        switch (roleActuel) {
            case EMPLOYER -> pdfEntity.setStatus(PdfStatus.EMPLOYER_SIGNED);
            case STUDENT -> pdfEntity.setStatus(PdfStatus.STUDENT_SIGNED);
            case GESTIONNAIRE -> pdfEntity.setStatus(PdfStatus.GESTIONNAIRE_SIGNED);
        }

        ententeStagePdfRepository.save(pdfEntity);
        return updatedPdf;
    }

    private void fillSignatureDate(Map<String, PdfFormField> fields, Role roleActuel) {
        String today = LocalDate.now().format(DATE_FORMATTER);
        switch (roleActuel) {
            case EMPLOYER -> {
                PdfFormField field = fields.get("date_signature_employeur");
                if (field != null) field.setValue(today);
            }
            case STUDENT -> {
                PdfFormField field = fields.get("date_signature_etudiant");
                if (field != null) field.setValue(today);
            }
            case GESTIONNAIRE -> {
                PdfFormField field = fields.get("date_signature_gestionnaire");
                if (field != null) field.setValue(today);
            }
        }
    }

    private void lockFieldsByRole(Map<String, PdfFormField> fields, Role roleActuel) {
        String[] allowedPrefixes;

        switch (roleActuel) {
            case EMPLOYER -> allowedPrefixes = new String[]{"signature_employeur", "date_signature_employeur"};
            case STUDENT -> allowedPrefixes = new String[]{"signature_etudiant", "date_signature_etudiant"};
            case GESTIONNAIRE -> allowedPrefixes = new String[]{"signature_gestionnaire", "date_signature_gestionnaire"};
            default -> allowedPrefixes = new String[]{};
        }

        for (Map.Entry<String, PdfFormField> entry : fields.entrySet()) {
            String key = entry.getKey();
            PdfFormField field = entry.getValue();

            boolean isAllowed = false;
            for (String prefix : allowedPrefixes) {
                if (key.startsWith(prefix)) {
                    isAllowed = true;
                    break;
                }
            }

            field.setReadOnly(!isAllowed);
        }
    }

    private String safe(String value) {
        return value != null ? value : "";
    }

    private String convertirSemaines(InternshipApplicationResponseDTO dto) {
        if (dto.getStartDate() == null || dto.getEndDate() == null) return "";
        long weeks = java.time.temporal.ChronoUnit.WEEKS.between(dto.getStartDate(), dto.getEndDate());
        return String.valueOf(weeks);
    }

    @Transactional
    public void claimApplication(Long applicationId, Long gestionnaireId) {
        InternshipApplication app = internshipApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalStateException("Application introuvable"));

        if (app.isClaimed()) {
            throw new InvalidInternshipApplicationException
                    ("Cette entente a déjà été prise en charge par un autre gestionnaire.");
        }

        app.setClaimed(true);
        app.setClaimedBy(gestionnaireId);
        internshipApplicationRepository.save(app);
    }
}
