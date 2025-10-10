package org.example.service;


import lombok.RequiredArgsConstructor;
import org.example.repository.EtudiantRepository;
import org.example.repository.InternshipApplicaitonRepository;
import org.example.repository.InternshipOfferRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InternshipApplicaitonService {
    private static final Logger logger = LoggerFactory.getLogger(InternshipOfferService.class);

    private final EtudiantRepository studentRepository;
    private final InternshipOfferRepository internshipOfferRepository;
    private final InternshipApplicaitonRepository internshipApplicaitonRepository;

    private final ApplicationEventPublisher eventPublisher;

}
