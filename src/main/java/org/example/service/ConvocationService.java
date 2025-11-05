package org.example.service;

import lombok.AllArgsConstructor;
import org.example.event.ConvocationCreatedEvent;
import org.example.event.ConvocationStatusChangedEvent;
import org.example.model.Convocation;
import org.example.model.Employer;
import org.example.model.Etudiant;
import org.example.model.InternshipApplication;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.ConvocationRepository;
import org.example.repository.EmployerRepository;
import org.example.repository.EtudiantRepository;
import org.example.repository.InternshipApplicationRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.internshipApplication.ConvocationDTO;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class ConvocationService {
    private static final Logger logger = LoggerFactory.getLogger(InternshipApplicationService.class);
    private final ConvocationRepository convocationRepository;
    private final EmployerRepository employerRepository;
    private final EtudiantRepository studentRepository;
    private final InternshipApplicationRepository internshipApplicationRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificationService notificationService;


    public ConvocationDTO createConvocation(ConvocationDTO convocationDTO) {
        Optional<Etudiant> student = studentRepository.findByCredentialsEmail(convocationDTO.getStudentEmail());
        Optional<Employer> employer = employerRepository.findByCredentialsEmail(convocationDTO.getEmployerEmail());

        if(student.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid convocation : student does not exist");
        }

        if(employer.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid convocation : employer does not exist");
        }

        Optional<InternshipApplication> internshipApplication = internshipApplicationRepository.findById(convocationDTO.getInternshipApplicationId());

        if(internshipApplication.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid convocation : internship application does not exist");
        }

        var internship = internshipApplication.get();

        if (!internship.getStudent().getId().equals(student.get().getId()) ||
                !internship.getOffer().getEmployer().getId().equals(employer.get().getId())) {
            throw new InvalidInternshipApplicationException("Invalid convocation: mismatched employer/student and application");
        }

        if (internship.getStatus() != ApprovalStatus.ACCEPTED) {
            throw new InvalidInternshipApplicationException("Convocation not allowed: application not approved");
        }

        Convocation convocation = Convocation.builder()
                .etudiant(student.get())
                .employer(employer.get())
                .status(convocationDTO.getStatus())
                .dateConvocation(convocationDTO.getConvocationDate())
                .location(convocationDTO.getLocation())
                .link(convocationDTO.getLink())
                .internshipApplication(internship)
                .build();

        var savedConvocation = convocationRepository.save(convocation);
        eventPublisher.publishEvent(new ConvocationCreatedEvent(savedConvocation, notificationService));
        logger.info("Convocation created for student={} employer={}",
                savedConvocation.getEtudiant().getEmail(),
                savedConvocation.getEmployer().getEmail());

        return ConvocationDTO.convertToDTO(savedConvocation);
    }

    public ConvocationDTO updateConvocationStatus(Long convocationId, String studentEmail, ApprovalStatus newStatus) {
        Optional<Convocation> convocation = convocationRepository.findById(convocationId);

        if(convocation.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid convocation : convocation does not exist");
        }

        Convocation updatedConvocation = convocation.get();

        if (updatedConvocation.getStatus() != ApprovalStatus.PENDING){
            throw new InvalidInternshipApplicationException("Convocation not allowed: application already modified.");
        }

        if (!updatedConvocation.getEtudiant().getCredentials().getEmail().equals(studentEmail)){
            throw new InvalidInternshipApplicationException("Invalid convocation : student does not exist");
        }

        updatedConvocation.setStatus(newStatus);
        var savedConvocation = convocationRepository.save(updatedConvocation);

        eventPublisher.publishEvent(new ConvocationStatusChangedEvent(savedConvocation, notificationService));
        logger.info("Convocation {} updated by student {} to status {}", convocationId, studentEmail, newStatus);
        return ConvocationDTO.convertToDTO(savedConvocation);
    }

    public List<ConvocationDTO> getAllConvocationsForStudent(String studentEmail) {
        Etudiant etudiant = studentRepository.findByCredentialsEmail(studentEmail)
                .orElseThrow(() -> new UserNotFoundException("Étudiant introuvable avec email " + studentEmail));

        return convocationRepository.findAllByEtudiant_Id(etudiant.getId())
                .stream()
                .map(ConvocationDTO::convertToDTO)
                .toList();
    }

    public List<ConvocationDTO> getAllConvocationsForEmployer(String employerEmail) {
        Employer employer = employerRepository.findByCredentialsEmail(employerEmail)
                .orElseThrow(() -> new UserNotFoundException("Étudiant introuvable avec email " + employerEmail));

        return convocationRepository.findAllByEmployer_Id(employer.getId())
                .stream()
                .map(ConvocationDTO::convertToDTO)
                .toList();
    }
}
