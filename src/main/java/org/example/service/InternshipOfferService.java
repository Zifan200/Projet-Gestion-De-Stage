package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.event.EmployerCreatedInternshipOfferEvent;
import org.example.event.InternshipOfferStatusChangeEvent;
import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.example.model.enums.InternshipOfferStatus;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.InternshipOfferListDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.exception.InvalidInternShipOffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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


    public InternshipOfferResponseDto saveInternshipOffer(
            String email,
            InternshipOfferDto internshipOfferDto) {
        Optional<Employer> savedEmployer = employerRepository.findByCredentialsEmail(email);

        if(internshipOfferDto.getTitle().isBlank() && internshipOfferDto.getDescription().isBlank()){
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
                .build();

        var savedInternshipOffer =  internshipOfferRepository.save(internshipOffer);
        eventPublisher.publishEvent(new EmployerCreatedInternshipOfferEvent());
        logger.info("InternshipOffer created = \"{}\"", savedInternshipOffer.getTitle());
        return InternshipOfferResponseDto.create(savedInternshipOffer);
    }
    public List<InternshipOfferListDto> getAllOffersSummary() {
        List<InternshipOfferListDto> offers = internshipOfferRepository.findAll()
                .stream()
                .map(offer -> InternshipOfferListDto.builder()
                        .id(offer.getId())
                        .title(offer.getTitle())
                        .enterpriseName(offer.getEmployer().getEnterpriseName())
                        .expirationDate(offer.getExpirationDate())
                        .build())
                .collect(Collectors.toList());

        if (offers.isEmpty()) {
            System.out.println("Aucune offre de stage disponible pour le moment.");
        }

        return offers;
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
                        .build())
                .toList();
    }
    public List<InternshipOfferListDto> getAcceptedOffers() {
        List<InternshipOfferListDto> acceptedOffers = internshipOfferRepository.findDistinctByStatus(InternshipOfferStatus.ACCEPTED)
                .stream()
                .map(offer -> InternshipOfferListDto.builder()
                        .id(offer.getId())
                        .title(offer.getTitle())
                        .enterpriseName(offer.getEmployer().getEnterpriseName())
                        .expirationDate(offer.getExpirationDate())
                        .build())
                .collect(Collectors.toList());
        return acceptedOffers;
    }

    public List<InternshipOfferDto> getRejectedOffers() {
        List<InternshipOffer> rejectedOffers =
                internshipOfferRepository.findDistinctByStatus(InternshipOfferStatus.REJECTED);

        return rejectedOffers.stream()
                .map(InternshipOfferDto::create)
                .toList();
    }

    public List<InternshipOfferDto> getPendingOffers() {
        List<InternshipOffer> pendingOffers =
                internshipOfferRepository.findDistinctByStatus(InternshipOfferStatus.PENDING);

        return pendingOffers.stream()
                .map(InternshipOfferDto::create)
                .toList();
    }


    public InternshipOfferResponseDto updateOfferStatus(Long offerId, InternshipOfferStatus status) {
        InternshipOffer offer = internshipOfferRepository.findById(offerId)
                .orElseThrow(() -> new InvalidInternShipOffer("Offer not found with id: " + offerId));
        offer.setStatus(status);
        internshipOfferRepository.save(offer);
        eventPublisher.publishEvent(new InternshipOfferStatusChangeEvent());
        return InternshipOfferResponseDto.create(offer);
    }

    public List<InternshipOfferListDto> getAcceptedOffersByProgramme(String programme) {
        return internshipOfferRepository.findAll()
                .stream()
                .filter(offer -> offer.getTargetedProgramme().equalsIgnoreCase(programme))
                .filter(offer -> offer.getStatus() == InternshipOfferStatus.ACCEPTED)
                .map(offer -> InternshipOfferListDto.builder()
                        .id(offer.getId())
                        .title(offer.getTitle())
                        .enterpriseName(offer.getEmployer().getEnterpriseName())
                        .expirationDate(offer.getExpirationDate())
                        .build())
                .toList();
    }

}
