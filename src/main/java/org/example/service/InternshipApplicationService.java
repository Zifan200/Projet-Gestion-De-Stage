package org.example.service;


import lombok.RequiredArgsConstructor;
import org.example.event.StudentCreatedInternshipApplicationCreatedEvent;
import org.example.model.CV;
import org.example.model.Etudiant;
import org.example.model.InternshipApplication;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;
import org.example.model.enums.SimpleEnumUtils;
import org.example.model.enums.InternshipOfferStatus;
import org.example.repository.CvRepository;
import org.example.repository.EtudiantRepository;
import org.example.repository.InternshipApplicationRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.dto.InternshipApplication.InternshipApplicationDTO;
import org.example.service.dto.InternshipApplication.InternshipApplicationResponseDTO;
import org.example.service.exception.InvalidApprovalStatus;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InternshipApplicationService {
    private static final Logger logger = LoggerFactory.getLogger(InternshipOfferService.class);

    private final EtudiantRepository studentRepository;
    private final CvRepository  cvRepository;
    private final InternshipOfferRepository internshipOfferRepository;
    private final InternshipApplicationRepository internshipApplicationRepository;

    private final ApplicationEventPublisher eventPublisher;

    public InternshipApplicationResponseDTO saveInternshipApplication(InternshipApplicationDTO internshipApplicationDto) {
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

        InternshipApplication application = InternshipApplication.builder()
                .student(student.get())
                .selectedStudentCV(selectedCV.get())
                .offer(offer.get())
                .status(ApprovalStatus.PENDING)
                .build();

        var savedInternshipApplication = internshipApplicationRepository.save(application);
        eventPublisher.publishEvent(new StudentCreatedInternshipApplicationCreatedEvent());
        logger.info("InternshipApplication created = \"{}\"", savedInternshipApplication.getStudent().getEmail());
        return InternshipApplicationResponseDTO.create(savedInternshipApplication);
    }

    public List<InternshipApplicationResponseDTO> getAllApplications(){
        return internshipApplicationRepository.findAll().stream().map(InternshipApplicationResponseDTO::create).collect(Collectors.toList());
    }

    public List<InternshipApplicationResponseDTO> getAllApplicationWithStatus(String status) throws InvalidInternshipApplicationException
    {
        if(SimpleEnumUtils.isValuePresentInEnum(ApprovalStatus.class, status)){
            throw new InvalidApprovalStatus("a application with invalid status was found");
        }
        List<InternshipApplication> applicationList = internshipApplicationRepository.findAllByStatus(SimpleEnumUtils.findEnumValue(ApprovalStatus.class, status));
        List<InternshipApplicationResponseDTO> response  = new ArrayList<>();
        for (InternshipApplication application : applicationList){
            response.add(InternshipApplicationResponseDTO.create(application));
        }
        return response;
    }

}
