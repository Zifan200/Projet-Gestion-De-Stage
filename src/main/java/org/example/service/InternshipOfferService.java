package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.InternshipOffer;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.exception.DuplicateUserException;
import org.example.service.exception.InvalidInternShipOffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InternshipOfferService {

    private static final Logger logger = LoggerFactory.getLogger(InternshipOfferService.class);
    private final InternshipOfferRepository internshipOfferRepository;



    public InternshipOfferResponseDto createInternshipOffer(InternshipOfferDto internshipOfferDto){
        if(internshipOfferDto.getTitle().isBlank() ||
            internshipOfferDto.getEmployer() == null ||
            internshipOfferDto.getPublishedDate() == null
        ){
            throw new InvalidInternShipOffer("Invalid internship offer (missing critical information)");
        }

        InternshipOffer internshipOffer = InternshipOffer.builder()
                .title(internshipOfferDto.getTitle())
                .description(internshipOfferDto.getDescription())
                .targeted_programme(internshipOfferDto.getTargeted_programme())
                .employer(internshipOfferDto.getEmployer())
                .publishedDate(internshipOfferDto.getPublishedDate())
                .expirationDate(internshipOfferDto.getExpirationDate())
                .build();

        var savedInternshipOffer =  internshipOfferRepository.save(internshipOffer);
        //***
        //TODO: add event for internship internshipOffer (publication / creation)
        // eventPublisher.publishEvent(new InternshipOffer);
        //***
        logger.info("InternshipOffer created = \"{}\"", internshipOffer.getTitle());
        return InternshipOfferResponseDto.create(savedInternshipOffer);
    }
}
