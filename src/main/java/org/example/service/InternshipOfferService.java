package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InternshipOfferService {
    private static final Logger logger = LoggerFactory.getLogger(InternshipOfferService.class);
    private final InternshipOfferRepository internshipOfferRepository;

    public InternshipOfferResponseDto saveInternshipOffer(InternshipOfferDto intershipOfferDto){

    }
}
