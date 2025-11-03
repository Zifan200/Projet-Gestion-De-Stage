package org.example.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.AreaBreakType;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import org.example.event.EmployerCreatedInternshipOfferEvent;
import org.example.event.InternshipOfferStatusChangeEvent;
import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.internship.InternshipOfferListDto;
import org.example.service.dto.internship.InternshipOfferResponseDto;
import org.example.service.dto.internship.InternshipOfferDto;
import org.example.service.exception.InvalidInternShipOffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InternshipOfferService {
    private static final Logger logger = LoggerFactory.getLogger(InternshipOfferService.class);
    private final EmployerRepository employerRepository;
    private final InternshipOfferRepository internshipOfferRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final DeepLTranslatorService deepLTranslator;


    public InternshipOfferResponseDto saveInternshipOffer(
            String email,
            InternshipOfferDto internshipOfferDto
    ) {
        Optional<Employer> savedEmployer = employerRepository.findByCredentialsEmail(email);

        if (internshipOfferDto.getTitle().isBlank() && internshipOfferDto.getDescription().isBlank()) {
            throw new InvalidInternShipOffer("Invalid internship offer (missing critical information)");
        }

        if (savedEmployer.isEmpty()) {
            throw new InvalidInternShipOffer("Invalid internship offer (employer does not exist)");
        }

        String session = getIntershipOfferSession(internshipOfferDto.getStartDate());

        InternshipOffer internshipOffer = InternshipOffer.builder()
                .title(internshipOfferDto.getTitle())
                .description(internshipOfferDto.getDescription())
                .targetedProgramme(internshipOfferDto.getTargetedProgramme())
                .employer(savedEmployer.get())
                .publishedDate(LocalDate.now())
                .expirationDate(internshipOfferDto.getExpirationDate())
                .startDate(internshipOfferDto.getStartDate())
                .endDate(internshipOfferDto.getEndDate())
                .session(session)
                .build();

        var savedInternshipOffer = internshipOfferRepository.save(internshipOffer);

        eventPublisher.publishEvent(new EmployerCreatedInternshipOfferEvent());
        logger.info("InternshipOffer created = \"{}\" (session = {})",
                savedInternshipOffer.getTitle(), session);

        InternshipOfferResponseDto responseDto = InternshipOfferResponseDto.create(savedInternshipOffer);
        responseDto.setSession(session);

        return responseDto;
    }



    public List<InternshipOfferListDto> getAllOffersFromEmployer(String email){
        Optional<Employer> employer = employerRepository.findByCredentialsEmail(email);
        if(employer.isEmpty()){
            throw new UserNotFoundException("employer not found");
        }
        List<InternshipOffer> offersList =  internshipOfferRepository.getAllByEmployerCredentialsEmail(email);
        return offersList.stream().map(InternshipOfferListDto::create).collect(Collectors.toList());
    }

    public List<InternshipOfferListDto> getAllOffersSummary() {
        List<InternshipOfferListDto> offers = internshipOfferRepository.findAll()
                .stream()
                .map(offer -> InternshipOfferListDto.builder()
                        .id(offer.getId())
                        .title(offer.getTitle())
                        .enterpriseName(offer.getEmployer().getEnterpriseName())
                        .expirationDate(offer.getExpirationDate())
                        .targetedProgramme(offer.getTargetedProgramme())
                        .reason(offer.getReason())
                        .status(offer.getStatus())
                        .startDate(offer.getStartDate())
                        .endDate(offer.getEndDate())
                        .session(offer.getSession())
                        .build())
                .collect(Collectors.toList());

        if (offers.isEmpty()) {
            System.out.println("Aucune offre de stage disponible pour le moment.");
        }
        return offers;
    }

    public List<InternshipOfferListDto> getAllOffersSummaryFromEmployer(String email) {
        Employer employer = employerRepository.findByCredentialsEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Étudiant introuvable avec email " + email));
        return employer
                .getInternshipOffers()
                .stream()
                .map(offer -> InternshipOfferListDto.builder()
                        .id(offer.getId())
                        .title(offer.getTitle())
                        .enterpriseName(offer.getEmployer().getEnterpriseName())
                        .description(offer.getDescription())
                        .expirationDate(offer.getExpirationDate())
                        .targetedProgramme(offer.getTargetedProgramme())
                        .reason(offer.getReason())
                        .status(offer.getStatus())
                        .applicationCount(offer.getApplications().size())
                        .startDate(offer.getStartDate())
                        .endDate(offer.getEndDate())
                        .session(offer.getSession())
                        .build())
                .collect(Collectors.toList());
    }


    public InternshipOfferResponseDto getOfferById(Long id) {
        InternshipOffer offer = internshipOfferRepository.findById(id)
                .orElseThrow(() -> new InvalidInternShipOffer("Internship offer not found with id: " + id));

        return InternshipOfferResponseDto.create(offer);
    }
    public List<String> getAllTargetedProgrammes() {
        return internshipOfferRepository.findAll().stream()
                .map(InternshipOffer::getTargetedProgramme)
                .distinct()
                .sorted()
                .toList();
    }

    public List<InternshipOfferListDto> getOffersByProgramme(String programme) {
        return internshipOfferRepository.findAll()
                .stream()
                .filter(offer -> offer.getTargetedProgramme().equalsIgnoreCase(programme))
                .map(offer -> InternshipOfferListDto.builder()
                        .id(offer.getId())
                        .title(offer.getTitle())
                        .enterpriseName(offer.getEmployer().getEnterpriseName())
                        .expirationDate(offer.getExpirationDate())
                        .targetedProgramme(offer.getTargetedProgramme())
                        .reason(offer.getReason())
                        .status(offer.getStatus())
                        .build())
                .toList();
    }

    public List<InternshipOfferListDto> getAcceptedOffers() {
        List<InternshipOffer> acceptedOffers =
                internshipOfferRepository.findDistinctByStatus(ApprovalStatus.ACCEPTED);

        return acceptedOffers.stream()
                .map(offer -> InternshipOfferListDto.builder()
                        .id(offer.getId())
                        .title(offer.getTitle())
                        .enterpriseName(offer.getEmployer().getEnterpriseName())
                        .expirationDate(offer.getExpirationDate())
                        .targetedProgramme(offer.getTargetedProgramme())
                        .reason(offer.getReason())
                        .status(offer.getStatus())
                        .startDate(offer.getStartDate())
                        .endDate(offer.getEndDate())
                        .session(offer.getSession())
                        .build())
                .toList();
    }
    public List<InternshipOfferListDto> getRejectedOffers() {
        List<InternshipOffer> rejectedOffers =
                internshipOfferRepository.findDistinctByStatus(ApprovalStatus.REJECTED);

        return rejectedOffers.stream()
                .map(offer -> InternshipOfferListDto.builder()
                        .id(offer.getId())
                        .title(offer.getTitle())
                        .enterpriseName(offer.getEmployer().getEnterpriseName())
                        .expirationDate(offer.getExpirationDate())
                        .targetedProgramme(offer.getTargetedProgramme())
                        .reason(offer.getReason())
                        .status(offer.getStatus())
                        .build())
                .toList();
    }

    public List<InternshipOfferListDto> getPendingOffers() {
        List<InternshipOffer> pendingOffers =
                internshipOfferRepository.findDistinctByStatus(ApprovalStatus.PENDING);

        return pendingOffers.stream()
                .map(offer -> InternshipOfferListDto.builder()
                        .id(offer.getId())
                        .title(offer.getTitle())
                        .enterpriseName(offer.getEmployer().getEnterpriseName())
                        .expirationDate(offer.getExpirationDate())
                        .targetedProgramme(offer.getTargetedProgramme())
                        .reason(offer.getReason())
                        .status(offer.getStatus())
                        .build())
                .toList();
    }


    public InternshipOfferResponseDto updateOfferStatus(Long offerId, ApprovalStatus status, String reasons) {
        if (status == null || reasons == null) {
            throw new InvalidInternShipOffer("Offer not found");
        }
        System.out.println(offerId);
        InternshipOffer offer = internshipOfferRepository.findById(offerId)
                .orElseThrow(() -> new InvalidInternShipOffer("Offer not found with id: " + offerId));
        offer.setStatus(status);
        offer.setReason(reasons);
        internshipOfferRepository.save(offer);
        eventPublisher.publishEvent(new InternshipOfferStatusChangeEvent());
        return InternshipOfferResponseDto.create(offer);
    }

    public List<InternshipOfferListDto> getAcceptedOffersByProgramme(String programme) {
        return internshipOfferRepository.findAll()
                .stream()
                .filter(offer -> offer.getTargetedProgramme().equalsIgnoreCase(programme))
                .filter(offer -> offer.getStatus() == ApprovalStatus.ACCEPTED)
                .map(offer -> InternshipOfferListDto.builder()
                        .id(offer.getId())
                        .title(offer.getTitle())
                        .enterpriseName(offer.getEmployer().getEnterpriseName())
                        .expirationDate(offer.getExpirationDate())
                        .build())
                .toList();
    }
    public byte[] generateInternshipOfferPdf(Long internshipOfferId) throws IOException {

        InternshipOffer offer = internshipOfferRepository.findInternshipOffersById(internshipOfferId)
                .orElseThrow(() -> new InvalidInternShipOffer(
                        "Aucun ID correspondant à l'offre de stage : " + internshipOfferId));

        InternshipOfferDto offerDto = InternshipOfferDto.create(offer);

        Optional<Employer> savedEmployer = employerRepository.findByCredentialsEmail(offer.getEmployer().getEmail());
        String employerCompany = savedEmployer.map(Employer::getEnterpriseName)
                .orElse("Entreprise inconnue");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

        Text programme = new Text(offerDto.getTargetedProgramme()).setFont(boldFont);
        Text datePostulation = new Text(offerDto.getPublishedDate() + " au "
                + offerDto.getExpirationDate() + ". ").setFont(boldFont);
        Text datePostulation_en = new Text(offerDto.getPublishedDate() + " to "
                + offerDto.getExpirationDate() + ". ").setFont(boldFont);
        Text email = new Text(offerDto.getEmployerEmail()).setFont(boldFont);



        // Traductions avec DeepL
        String programmeTraduction;
        String titleTraduction;
        String descriptionTraduction;

        try {
            programmeTraduction = deepLTranslator.translate(offerDto.getTargetedProgramme(), "en-US");
        } catch (Exception e) {
            System.err.println("Erreur DeepL : " + e.getMessage());
            programmeTraduction = offerDto.getTargetedProgramme();
        }

        try {
            titleTraduction = deepLTranslator.translate(offerDto.getTitle(), "en-US");
        } catch (Exception e) {
            System.err.println("Erreur DeepL : " + e.getMessage());
            titleTraduction = offerDto.getTitle();
        }

        try {
            descriptionTraduction = deepLTranslator.translate(offerDto.getDescription(), "en-US");
        } catch (Exception e) {
            System.err.println("Erreur DeepL : " + e.getMessage());
            descriptionTraduction = offerDto.getDescription();
        }

        Text programmeEnText = new Text(programmeTraduction).setFont(boldFont);

        // Page Française

        Paragraph title = new Paragraph(offerDto.getTitle())
                .setFont(boldFont)
                .setFontSize(25)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(60f)
                .setMarginBottom(40f);
        document.add(title);

        Paragraph intro = new Paragraph("\n Notre offre de stage s'adresse plus particulièrement aux étudiants en ")
                .add(programme)
                .add(".")
                .setFontSize(15)
                .setMarginBottom(20f);
        document.add(intro);

        Paragraph description = new Paragraph("Voici un petit aperçu de ce qui serait à s'attendre :" + "\n")
                .setFontSize(15);
        document.add(description);

        Paragraph stageInfos = new Paragraph(offerDto.getDescription())
                .setFontSize(15)
                .setMarginTop(20f)
                .setMarginBottom(20f);
        document.add(stageInfos);

        Paragraph date = new Paragraph("L'offre de stage sera disponible du ")
                .add(datePostulation)
                .setFontSize(15)
                .setMarginBottom(20f);
        document.add(date);

        Paragraph contact = new Paragraph("Pour plus d'informations, n'hésitez pas à nous contacter à l'adresse" +
                " courriel suivante : ")
                .add(email)
                .add(".")
                .setFontSize(15)
                .setMarginBottom(40f);
        document.add(contact);

        Paragraph salutations = new Paragraph("Au plaisir de vous revoir," + "\n" + employerCompany)
                .setFont(boldFont)
                .setFontSize(15);
        document.add(salutations);

        // Page Anglaise

        document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));

        Paragraph titleEn = new Paragraph(titleTraduction)
                .setFont(boldFont)
                .setFontSize(25)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(60f)
                .setMarginBottom(40f);
        document.add(titleEn);

        Paragraph introEn = new Paragraph("\n Our internship offer is mainly targeting students in ")
                .add(programmeEnText)
                .add(".")
                .setFontSize(15)
                .setMarginBottom(20f);
        document.add(introEn);

        Paragraph descriptionEn = new Paragraph("Here's a quick glance of what will be expected from this internship :" + "\n")
                .setFontSize(15);
        document.add(descriptionEn);

        Paragraph stageInfosEn = new Paragraph(descriptionTraduction)
                .setFontSize(15)
                .setMarginTop(20f)
                .setMarginBottom(20f);
        document.add(stageInfosEn);

        Paragraph dateEn = new Paragraph("This internship offer will be available from ")
                .add(datePostulation_en)
                .setFontSize(15)
                .setMarginBottom(20f);
        document.add(dateEn);

        Paragraph contactEn = new Paragraph("For more informations, dont hesitate to contact us at : ")
                .add(email)
                .add(".")
                .setFontSize(15)
                .setMarginBottom(40f);
        document.add(contactEn);

        Paragraph salutationsEn = new Paragraph("We hope to hear back from you," + "\n" + employerCompany)
                .setFont(boldFont)
                .setFontSize(15);
        document.add(salutationsEn);

        document.close();
        return outputStream.toByteArray();
    }

    public String getIntershipOfferSession(LocalDate startDate) {
        if (startDate == null) {
            return "Aucune session (date non définie)";
        }

        int mois = startDate.getMonthValue();

        if (mois >= 1 && mois <= 4) {
            return "Hiver";
        } else if (mois >= 9 && mois <= 12) {
            return "Automne";
        } else {
            return "Été";
        }
    }


}
