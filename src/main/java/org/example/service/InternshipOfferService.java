package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.exception.InvalidInternShipOffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InternshipOfferService {

    private static final Logger logger = LoggerFactory.getLogger(InternshipOfferService.class);
    private final EmployerRepository employerRepository;
    private final InternshipOfferRepository internshipOfferRepository;



    public InternshipOfferResponseDto saveInternshipOffer(InternshipOfferDto internshipOfferDto){
        Optional<Employer> savedEmployer = employerRepository.findByCredentialsEmail(internshipOfferDto.getEmployerEmail());
        if(internshipOfferDto.getTitle().isBlank() ||
            internshipOfferDto.getPublishedDate() == null
        ){
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
                .publishedDate(LocalDateTime.now())
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
