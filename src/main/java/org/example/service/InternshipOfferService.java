package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.event.EmployerCreatedInternshipOfferEvent;
import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.exception.FileProcessingException;
import org.example.service.exception.InvalidFileFormatException;
import org.example.service.exception.InvalidInternShipOffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InternshipOfferService {
    private static final long MAX_SIZE = 5 * 1024 * 1024;
    private static final Logger logger = LoggerFactory.getLogger(InternshipOfferService.class);
    private final EmployerRepository employerRepository;
    private final InternshipOfferRepository internshipOfferRepository;
    private final ApplicationEventPublisher eventPublisher;


    public InternshipOfferResponseDto saveInternshipOffer(
            String email,
            InternshipOfferDto internshipOfferDto) {
        Optional<Employer> savedEmployer = employerRepository.findByCredentialsEmail(email);

        if(internshipOfferDto.getTitle().isBlank()){
            throw new InvalidInternShipOffer("Invalid internship offer (missing critical information)");
        }
        if(savedEmployer.isEmpty())
        {
            throw new InvalidInternShipOffer("Invalid internship offer (employer does not exist) " + savedEmployer);
        }

        InternshipOffer internshipOffer = InternshipOffer.builder()
                .title(internshipOfferDto.getTitle())
                .description(internshipOfferDto.getDescription())
                .targetedProgramme(internshipOfferDto.getTargetedProgramme())
                .employer(savedEmployer.get())
                .publishedDate(LocalDate.now())
                .expirationDate(internshipOfferDto.getExpirationDate())
                .attachmentPresent(false)
                .build();

        var savedInternshipOffer =  internshipOfferRepository.save(internshipOffer);
        eventPublisher.publishEvent(new EmployerCreatedInternshipOfferEvent());
        logger.info("InternshipOffer created = \"{}\"", savedInternshipOffer.getTitle());
        return InternshipOfferResponseDto.create(savedInternshipOffer);
    }

    public InternshipOfferResponseDto saveInternshipOfferWithAttachment(
            String email,
            InternshipOfferDto internshipOfferDto,
            Optional<MultipartFile> offerAttachmentFile) {
        Optional<Employer> savedEmployer = employerRepository.findByCredentialsEmail(email);

        if(internshipOfferDto.getTitle().isBlank()){
            throw new InvalidInternShipOffer("Invalid internship offer (missing critical information)");
        }
        if(savedEmployer.isEmpty())
        {
            throw new InvalidInternShipOffer("Invalid internship offer (employer does not exist) " + savedEmployer);
        }

        if(offerAttachmentFile.isEmpty()){
            throw new InvalidInternShipOffer("Invalid internship offer file (empty attachment)");
        }

        try {
            MultipartFile offerAttachment = offerAttachmentFile.get();
            validateFile(offerAttachment);

            InternshipOffer internshipOffer = InternshipOffer.builder()
                    .title(internshipOfferDto.getTitle())
                    .description(internshipOfferDto.getDescription())
                    .targetedProgramme(internshipOfferDto.getTargetedProgramme())
                    .employer(savedEmployer.get())
                    .publishedDate(LocalDate.now())
                    .expirationDate(internshipOfferDto.getExpirationDate())
                    .attachmentPresent(true)
                    .fileName(offerAttachment.getOriginalFilename())
                    .fileType(offerAttachment.getContentType())
                    .fileSize(offerAttachment.getSize())
                    .fileData(offerAttachment.getBytes())
                    .build();

            var savedInternshipOffer =  internshipOfferRepository.save(internshipOffer);
            eventPublisher.publishEvent(new EmployerCreatedInternshipOfferEvent());
            logger.info("InternshipOffer created = \"{}\"", savedInternshipOffer.getTitle());
            return InternshipOfferResponseDto.create(savedInternshipOffer);
        } catch (IOException e) {
            throw new FileProcessingException("Impossible de lire le fichier", e);
        }
    }


    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileFormatException("Aucun fichier fourni.");
        }

        List<String> allowedTypes = List.of(
                "application/pdf",
                "application/msword"
        );

        if (!allowedTypes.contains(file.getContentType())) {
            throw new InvalidFileFormatException("Seuls les fichiers PDF ou Word (.doc/.docx) sont acceptés.");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new InvalidFileFormatException("Le fichier dépasse la taille maximale de 5 Mo.");
        }
    }
}
