package org.example.service;


import lombok.RequiredArgsConstructor;
import org.example.event.StudentCreatedInternshipApplicationCreatedEvent;
import org.example.model.CV;
import org.example.model.Etudiant;
import org.example.model.InternshipApplication;
import org.example.model.InternshipOffer;
import org.example.model.enums.InternshipOfferStatus;
import org.example.repository.CvRepository;
import org.example.repository.EtudiantRepository;
import org.example.repository.InternshipApplicationRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.InternshipApplicaiton.InternshipApplicationDTO;
import org.example.service.dto.InternshipApplicaiton.InternshipApplicationResponseDTO;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InternshipApplicationService {
    private static final Logger logger = LoggerFactory.getLogger(InternshipOfferService.class);

    private final EtudiantRepository studentRepository;
    private final CvRepository  cvRepository;
    private final InternshipOfferRepository internshipOfferRepository;
    private final InternshipApplicationRepository internshipApplicationRepository;

    private final ApplicationEventPublisher eventPublisher;

    public InternshipApplicationResponseDTO saveInternshipApplicaiton(InternshipApplicationDTO internshipApplicationDto) {
        Optional<Etudiant> student = studentRepository.findByCredentialsEmail(internshipApplicationDto.getStudentEmail());
        Optional<CV> selectedCV = cvRepository.findById(internshipApplicationDto.getSelectedCvID());
        Optional<InternshipOffer> offer = internshipOfferRepository.findById(internshipApplicationDto.getInternshipOfferId());
        if(student.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : student does not exist");
        }
        if(selectedCV.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : cv does not exist");
        }
        if(selectedCV.get().getStatus() == InternshipOfferStatus.PENDING || selectedCV.get().getStatus() == InternshipOfferStatus.REJECTED){
            throw  new InvalidInternshipApplicationException("Invalid internship offer : cv is not a acceptable status");
        }
        if(offer.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : internship offer does not exist");
        }

        InternshipApplication applicaiton = InternshipApplication.builder()
                .student(student.get())
                .selectedStudentCV(selectedCV.get())
                .offer(offer.get())
                .build();

        var savedInternshipApplicaiton = internshipApplicationRepository.save(applicaiton);
        eventPublisher.publishEvent(new StudentCreatedInternshipApplicationCreatedEvent());
        logger.info("InternshipApplicaiton created = \"{}\"", savedInternshipApplicaiton.getId());
        return InternshipApplicationResponseDTO.create(savedInternshipApplicaiton);
    }
}
