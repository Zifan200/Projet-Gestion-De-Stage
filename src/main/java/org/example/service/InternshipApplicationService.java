package org.example.service;


import lombok.AllArgsConstructor;
import org.example.event.InternshipApplicationStatusChangeEvent;
import org.example.event.StudentCreatedInternshipApplicationCreatedEvent;
import org.example.model.*;
import org.example.model.enums.ApprovalStatus;
import org.example.model.enums.SimpleEnumUtils;
import org.example.repository.*;
import org.example.service.dto.internshipApplication.InternshipApplicationDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.dto.student.EtudiantDTO;
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

@AllArgsConstructor
@Service
public class InternshipApplicationService {
    private static final Logger logger = LoggerFactory.getLogger(InternshipApplicationService.class);
    private final EmployerRepository employerRepository;
    private final EtudiantRepository studentRepository;
    private final CvRepository  cvRepository;
    private final InternshipOfferRepository internshipOfferRepository;
    private final InternshipApplicationRepository internshipApplicationRepository;
    private final EtudiantRepository etudiantRepository;

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
        if(selectedCV.get().getStatus() == ApprovalStatus.PENDING || selectedCV.get().getStatus() == ApprovalStatus.REJECTED){
            throw  new InvalidInternshipApplicationException("Invalid internship offer : cv is not a acceptable status");
        }
        if(offer.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : internship offer does not exist");
        }
        InternshipOffer saveOffer = offer.get();
        Optional<Employer> employer = employerRepository.findByCredentialsEmail(saveOffer.getEmployer().getEmail());
        if(employer.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : employer does not exist");
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

    public List<InternshipApplicationResponseDTO> getAllApplicationsWithStatus(String status){
        //check if status is a valid status
        if(!SimpleEnumUtils.isValuePresentInEnum(ApprovalStatus.class, status)){
            throw new InvalidApprovalStatus("a application with invalid status was found");
        }

        List<InternshipApplication> applicationList = internshipApplicationRepository.findAllByStatus(SimpleEnumUtils.findEnumValue(ApprovalStatus.class, status));
        return applicationList.stream().map(InternshipApplicationResponseDTO::create).collect(Collectors.toList());
    }

    public List<InternshipApplicationResponseDTO> getAllApplicationsFromOfferId(Long offerId){
        //check if offer exists
        Optional<InternshipOffer> offer = internshipOfferRepository.findById(offerId);
        if(offer.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : offer does not exist");
        }
        List<InternshipApplication> applicationList = internshipApplicationRepository.findAllByOfferId(offer.get().getId());
        return applicationList.stream().map(InternshipApplicationResponseDTO::create).toList();
    }

    public List<InternshipApplicationResponseDTO> getAllApplicationsFromOfferWithStatus(Long offerId, String status){
        //check if status is a valid status
        if(!SimpleEnumUtils.isValuePresentInEnum(ApprovalStatus.class, status)){
            throw new InvalidApprovalStatus("a application with invalid status was found");
        }

        //check if offer exists
        Optional<InternshipOffer> offer = internshipOfferRepository.findById(offerId);
        if(offer.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : offer does not exist");
        }

        List<InternshipApplication> applicationList = internshipApplicationRepository.findAllByOfferAndStatus(offer.get(),  SimpleEnumUtils.findEnumValue(ApprovalStatus.class, status));
        return applicationList.stream().map(InternshipApplicationResponseDTO::create).collect(Collectors.toList());
    }

    public InternshipApplicationResponseDTO getApplicationByEmployerAndId(String email, Long id){
        Optional<Employer> employer = employerRepository.findByCredentialsEmail(email);
        if(employer.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship application : employer does not exist");
        }
        Optional<InternshipApplication>  application = internshipApplicationRepository.findById(id);
        if(application.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship application : application does not exist");
        }

        InternshipApplication savedApplication =  application.get();
        if(!savedApplication.getOffer().getEmployer().getEmail().equals(email)){
            throw new InvalidInternshipApplicationException("Invalid internship application : employer does not exist");
        }

        return InternshipApplicationResponseDTO.create(savedApplication);
    }

    public List<InternshipApplicationResponseDTO> getAllApplicationsFromEmployer(String email){
        Optional<Employer> employer = employerRepository.findByCredentialsEmail(email);
        if(employer.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : employer does not exist");
        }
        List<InternshipApplication> applicationList = internshipApplicationRepository.getAllByOfferEmployerCredentialsEmail(email);
        return applicationList.stream().map(InternshipApplicationResponseDTO::create).collect(Collectors.toList());
    }

    public List<InternshipApplicationResponseDTO> getAllApplicationsFromOfferFromEmployer(Long id, String email){
        Optional<Employer> employer = employerRepository.findByCredentialsEmail(email);
        Optional<InternshipOffer> offer = internshipOfferRepository.findById(id);

        if(employer.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : employer does not exist");
        }
        if(offer.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : offer does not exist");
        }

        List<InternshipApplication> applicationList = internshipApplicationRepository.getAllByOfferEmployerCredentialsEmail(email);
        return applicationList.stream().map(InternshipApplicationResponseDTO::create).collect(Collectors.toList());
    }

    public InternshipApplicationResponseDTO getApplicationByStudentAndId(String email, Long id) {
        Optional<Etudiant> student = etudiantRepository.findByCredentialsEmail(email);
        if (student.isEmpty()) {
            throw new InvalidInternshipApplicationException(
                    "Invalid internship application: student not found with email " + email
            );
        }

        Optional<InternshipApplication> application = internshipApplicationRepository.findById(id);
        if (application.isEmpty()) {
            throw new InvalidInternshipApplicationException(
                    "Invalid internship application : application does not exist"
            );
        }

        InternshipApplication savedApplication = application.get();
        return InternshipApplicationResponseDTO.create(savedApplication);
    }

    public List<EtudiantDTO> getAllStudentsWithApplication(){
        List<EtudiantDTO> studentList = new ArrayList<>();
        for(Etudiant etudiant : etudiantRepository.findByApplicationsIsNotEmpty()){
            studentList.add(EtudiantDTO.fromEntity(etudiant));
        }
        return studentList;
    }

    public List<InternshipApplicationResponseDTO> getAllApplicationsFromStudent(String email) {
        Optional<Etudiant> student = studentRepository.findByCredentialsEmail(email);
        if(student.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship offer : student does not exist");
        }
        List<InternshipApplication> list = internshipApplicationRepository.findAllByStudentCredentialsEmail(email);
        return list.stream().map(InternshipApplicationResponseDTO::create).toList();
    }

    public List<InternshipApplicationResponseDTO> getAllApplicationsFromStudentByStatus(String email, String status) {
        Optional<Etudiant> student = studentRepository.findByCredentialsEmail(email);
        if(student.isEmpty()){
            throw new InvalidInternshipApplicationException("Invalid internship application : student does not exist");
        }

        if(!SimpleEnumUtils.isValuePresentInEnum(ApprovalStatus.class, status)){
            throw new InvalidApprovalStatus("Invalid internship application status");
        }

        List<InternshipApplication> list = internshipApplicationRepository.findAllByStudentCredentialsEmailAndStatus(
                email,
                SimpleEnumUtils.findEnumValue(ApprovalStatus.class, status)
        );
        return list.stream().map(InternshipApplicationResponseDTO::create).toList();
    }


    public InternshipApplicationResponseDTO approveInternshipApplication(String email, Long applicationId) {
        Optional<Employer> employer = employerRepository.findByCredentialsEmail(email);
        if(employer.isEmpty())
            throw new InvalidInternshipApplicationException("Invalid internship offer : employer does not exist");

        InternshipApplication application = internshipApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new InvalidInternshipApplicationException(
                        "Application not found with id: " + applicationId
                ));

        application.setStatus(ApprovalStatus.ACCEPTED);
        internshipApplicationRepository.save(application);

        eventPublisher.publishEvent(new InternshipApplicationStatusChangeEvent());
        return InternshipApplicationResponseDTO.create(application);
    }

    public InternshipApplicationResponseDTO rejectInternshipApplication(
            String email, Long applicationId, String reasons
    ) {
        Optional<Employer> employer = employerRepository.findByCredentialsEmail(email);
        if(employer.isEmpty())
            throw new InvalidInternshipApplicationException("Invalid internship offer : employer does not exist");

        if (reasons == null)
            throw new InvalidInternshipApplicationException("Must provide a reason when rejecting an application");

        InternshipApplication application = internshipApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new InvalidInternshipApplicationException(
                        "Application not found with id: " + applicationId
                ));

        application.setStatus(ApprovalStatus.REJECTED);
        application.setReason(reasons);
        internshipApplicationRepository.save(application);

        eventPublisher.publishEvent(new InternshipApplicationStatusChangeEvent());
        return InternshipApplicationResponseDTO.create(application);
    }
}
