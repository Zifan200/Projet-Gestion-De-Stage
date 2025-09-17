package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.InternshipOffer;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InternshipOfferService {
    private static final Logger logger = LoggerFactory.getLogger(InternshipOfferService.class);
    private final InternshipOfferRepository internshipOfferRepository;
    private final ApplicationEventPublisher eventPublisher;

    public InternshipOfferResponseDto createInternshipOffer(InternshipOfferDto intershipOfferDto){
        InternshipOffer offer = InternshipOffer.builder()
                .title(intershipOfferDto.getTitle())
                .description(intershipOfferDto.getDescription())
                .targeted_programme(intershipOfferDto.getTargeted_programme())
                .publishedDate(intershipOfferDto.getPublishedDate())
                .expirationDate(intershipOfferDto.getExpirationDate())
                .build();

        var savedInternshipOffer =  internshipOfferRepository.save(offer);
        //TODO: add event for internship offer (publication / creation)
        //        eventPublisher.publishEvent(new User);
        logger.info("InternshipOffer created = {}", offer.getTitle());
        return InternshipOfferResponseDto.create(savedInternshipOffer);
    }
}
