package org.example.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.model.InternshipOffer;
import org.example.service.InternshipOfferService;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/employer/internshipOffers")
public class InternshipOfferController {
    private static final Logger logger = LoggerFactory.getLogger(InternshipOfferService.class);
    private final InternshipOfferService internshipOfferService;

    @PostMapping("/create_offer")
    public ResponseEntity<InternshipOfferResponseDto> createInternShipOffer(@Valid @RequestBody InternshipOfferDto internshipOfferDto) {
        logger.info("InternshipOffer created (Controller) = \"{}\"", internshipOfferDto.getTitle());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(internshipOfferService.saveInternshipOffer(internshipOfferDto));
    }
}
