package org.example;



import org.example.service.dto.cv.CvResponseDTO;
import org.example.service.dto.employer.EmployerDto;
import org.example.service.dto.gestionnaire.GestionnaireDTO;
import org.example.service.dto.internship.InternshipOfferDto;
import org.example.service.dto.internship.InternshipOfferListDto;
import org.example.service.dto.internship.InternshipOfferResponseDto;
import org.example.service.dto.internshipApplication.InternshipApplicationDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.model.auth.Role;
import org.example.model.CV;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.CvRepository;
import org.example.service.*;
import org.example.service.dto.student.EtudiantDTO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class Main {
    private final GestionnaireService gestionnaireService;
    private final EmployerService employerService;
    private final StudentService studentService;
    private final CVService cvService;

    public Main(GestionnaireService gestionnaireService, EmployerService employerService, StudentService studentService, CVService cvService) {
        this.gestionnaireService = gestionnaireService;
        this.employerService = employerService;
        this.studentService = studentService;
        this.cvService = cvService;

    }

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }

    @Bean
    CommandLineRunner commandLineRunner(ApplicationContext context) {
        return args -> {

            // -----------------------------
            // 1️⃣ Création du gestionnaire
            // -----------------------------
            GestionnaireDTO admin = GestionnaireDTO.builder()
                    .firstName("François")
                    .lastName("Lacoursière")
                    .email("francoislacoursiere@test.com")
                    .password("Test123!")
                    .phone("5144381800")
                    .build();

            gestionnaireService.saveGestionnaire(admin);
            System.out.println("✅ Gestionnaire créé : " + admin.getEmail());



            // -----------------------------
            // 2️⃣ Création de l’employeur
            // -----------------------------
            EmployerService employerService = context.getBean(EmployerService.class);
            InternshipOfferService internshipOfferService = context.getBean(InternshipOfferService.class);

            EmployerDto employer = EmployerDto.builder()
                    .firstName("Alice")
                    .lastName("Dupont")
                    .email("alice@example.com")
                    .password("Test123!")
                    .since(LocalDate.of(2020, 1, 1))
                    .enterpriseName("TechCorp")
                    .phone("123-456-7890")
                    .build();
            employerService.saveEmployer(employer);
            System.out.println("✅ Employeur créé : " + employer.getEnterpriseName());

            // -----------------------------
            // 3️⃣ Création d’offres de stage
            // -----------------------------
            InternshipOfferDto offer1 = InternshipOfferDto.builder()
                    .title("Développeur Java")
                    .description("Stage backend Java Spring Boot")
                    .targetedProgramme("Cinéma")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(2))
                    .build();
            InternshipOfferResponseDto savedOffer1 = internshipOfferService.saveInternshipOffer("alice@example.com", offer1);

            InternshipOfferDto offer2 = InternshipOfferDto.builder()
                    .title("Frontend React")
                    .description("Stage développement frontend React")
                    .targetedProgramme("Informatique")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(3))
                    .build();
            InternshipOfferResponseDto savedOffer2 = internshipOfferService.saveInternshipOffer("alice@example.com", offer2);

            InternshipOfferDto offer3 = InternshipOfferDto.builder()
                    .title("Data Analyst")
                    .description("Stage analyse de données et visualisation")
                    .targetedProgramme("Informatique")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(4))
                    .build();
            InternshipOfferResponseDto savedOffer3 = internshipOfferService.saveInternshipOffer("alice@example.com", offer3);

            InternshipOfferDto offer4 = InternshipOfferDto.builder()
                    .title("Soins infirmiers")
                    .description("Stage pratique soins infirmiers")
                    .targetedProgramme("Soins infirmiers")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(2))
                    .build();
            InternshipOfferResponseDto savedOffer4 = internshipOfferService.saveInternshipOffer("alice@example.com", offer4);

            InternshipOfferDto offer5 = InternshipOfferDto.builder()
                    .title("Frontend Angular")
                    .description("Stage développement frontend Angular")
                    .targetedProgramme("Informatique")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(1))
                    .build();
            InternshipOfferResponseDto savedOffer5 = internshipOfferService.saveInternshipOffer("alice@example.com", offer5);

            InternshipOfferDto offer6 = InternshipOfferDto.builder()
                    .title("AI & Data Engineer")
                    .description("Experience required in Python and Machine Learning algorithms")
                    .targetedProgramme("Informatique")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(1))
                    .build();
            InternshipOfferResponseDto savedOffer6 = internshipOfferService.saveInternshipOffer("alice@example.com", offer6);

            EtudiantDTO etudiantDTO = studentService.inscriptionEtudiant(
              EtudiantDTO.builder()
                      .firstName("Alexandre")
                      .lastName("Nowell")
                      .email("alexandre@example.com")
                      .phone("514-999-9999")
                      .adresse("Pole nord")
                      .role(Role.STUDENT)
                      .password("Test123!")
                      .program("Technique de l'informatique")
                      .build()
            );

            byte[] fakePdf = "Fake PDF content for demo".getBytes();

            MultipartFile file = new MockMultipartFile(
                    "file",
                    "cv_test.txt",
                    "application/pdf",
                    "Mon CV de test".getBytes()
            );
            CvResponseDTO cvResponseDTO = cvService.addCv(etudiantDTO.getEmail(), file);
            cvService.approveCv(cvResponseDTO.getId());





            // -----------------------------
            // 4️⃣ Mise à jour des statuts
            // -----------------------------
            internshipOfferService.updateOfferStatus(savedOffer1.getId(), ApprovalStatus.ACCEPTED, "je taimes");
            internshipOfferService.updateOfferStatus(savedOffer2.getId(), ApprovalStatus.ACCEPTED, "t cool");
            internshipOfferService.updateOfferStatus(savedOffer4.getId(), ApprovalStatus.REJECTED, "pas intéressant");
            internshipOfferService.updateOfferStatus(savedOffer5.getId(), ApprovalStatus.ACCEPTED, "");
            internshipOfferService.updateOfferStatus(savedOffer6.getId(), ApprovalStatus.ACCEPTED, "");

            // -----------------------------
            // 5️⃣ Afficher toutes les offres
            // -----------------------------
            System.out.println("\n=== Toutes les offres (résumé) ===");
            List<InternshipOfferListDto> allOffers = internshipOfferService.getAllOffersSummary();
            allOffers.forEach(o -> System.out.println(
                    "ID: " + o.getId() + " | " + o.getTitle() +
                            " - " + o.getEnterpriseName() +
                            " (Expiration: " + o.getExpirationDate() + ")"
            ));

            // -----------------------------
            // 6️⃣ Offres ACCEPTED pour Informatique
            // -----------------------------
            System.out.println("\n=== Offres ACCEPTED pour Informatique ===");
            List<InternshipOfferListDto> acceptedOffers = internshipOfferService.getOffersByProgramme("Informatique");
            acceptedOffers.forEach(o -> System.out.println(
                    "ID: " + o.getId() + " | " + o.getTitle() + " - " + o.getEnterpriseName()
            ));

            // -----------------------------
            // 7️⃣ Offres PENDING
            // -----------------------------
            System.out.println("\n=== Offres PENDING ===");
            internshipOfferService.getPendingOffers().forEach(o ->
                    System.out.println("ID: " + o.getId() + " | " + o.getTitle())
            );

            // -----------------------------
            // 8️⃣ Offres REJECTED
            // -----------------------------
            System.out.println("\n=== Offres REJECTED ===");
            internshipOfferService.getRejectedOffers().forEach(o ->
                    System.out.println("ID: " + o.getId() + " | " + o.getTitle())
            );

            // [9] creation student
            StudentService studentService = context.getBean(StudentService.class);
            CvRepository cvRepository = context.getBean(CvRepository.class);
            InternshipApplicationService internshipApplicationService = context.getBean(InternshipApplicationService.class);

            EtudiantDTO studentDTO = EtudiantDTO.builder()
                    .firstName("jimmy")
                    .lastName("jammer")
                    .email("jimmy@hotmail.com")
                    .password("Test123!")
                    .phone("123-123-1234")
                    .program("Technique Informatique")
                    .build();



            EtudiantDTO savedEtudiant = studentService.inscriptionEtudiant(studentDTO);
            byte[] bytes = new byte[9];
            CV studentCV = CV.builder()
                    .etudiant(EtudiantDTO.toEntity(savedEtudiant))
                    .data(bytes)
                    .fileName("My Cv")
                    .fileSize(1L)
                    .fileType("pdf")
                    .reason("")
                    .uploadedAt(LocalDateTime.now())
                    .status(ApprovalStatus.ACCEPTED)
                    .build();
            cvRepository.save(studentCV);


            List<EtudiantDTO> tempStudents = new ArrayList<>();
            for(int index = 0; index < 20; index++){
                EtudiantDTO tempStudent = EtudiantDTO.builder()
                        .firstName("student"+index)
                        .lastName("lastName"+index)
                        .email("student"+index+"@hotmail.com")
                        .password("Test123!")
                        .phone("123-123-1234")
                        .program("Technique Informatique")
                        .build();
                tempStudents.add(tempStudent);
                EtudiantDTO savedStudent = studentService.inscriptionEtudiant(tempStudent);
                CV tempCv = CV.builder()
                        .etudiant(EtudiantDTO.toEntity(savedStudent))
                        .data(bytes)
                        .fileName("My Cv")
                        .fileSize(1L)
                        .fileType("pdf")
                        .reason("")
                        .uploadedAt(LocalDateTime.now())
                        .status(ApprovalStatus.ACCEPTED)
                        .build();
                CV savedCv = (CV)cvRepository.save(tempCv);
                InternshipApplicationDTO tempApplication = InternshipApplicationDTO.builder()
                        .internshipOfferId(savedOffer1.getId())
                        .employerEmail(employer.getEmail())
                        .studentEmail(savedStudent.getEmail())
                        .selectedCvID(savedCv.getId()).build();
                InternshipApplicationResponseDTO savedTempApplication =
                        internshipApplicationService.saveInternshipApplication(tempApplication);
            }


            // ----------------------------
            // [10] Création d'applications
            // ----------------------------

            InternshipApplicationDTO internshipApplicationDTO1 = InternshipApplicationDTO.builder()
                            .internshipOfferId(savedOffer1.getId())
                                    .employerEmail(employer.getEmail())
                                            .studentEmail(studentDTO.getEmail())
                                                    .selectedCvID(studentCV.getId()).build();

            InternshipApplicationDTO internshipApplicationDTO2 = InternshipApplicationDTO.builder()
                            .internshipOfferId(savedOffer2.getId())
                                    .employerEmail(employer.getEmail())
                                            .studentEmail(studentDTO.getEmail())
                                                    .selectedCvID(studentCV.getId()).build();

            InternshipApplicationDTO internshipApplicationDTO3 = InternshipApplicationDTO.builder()
                            .internshipOfferId(savedOffer5.getId())
                                    .employerEmail(employer.getEmail())
                                            .studentEmail(studentDTO.getEmail())
                                                    .selectedCvID(studentCV.getId()).build();

            InternshipApplicationDTO internshipApplicationDTO4 = InternshipApplicationDTO.builder()
                            .internshipOfferId(savedOffer6.getId())
                                    .employerEmail(employer.getEmail())
                                            .studentEmail(studentDTO.getEmail())
                                                    .selectedCvID(studentCV.getId()).build();

            InternshipApplicationDTO internshipApplicationDTO5 = InternshipApplicationDTO.builder()
                            .internshipOfferId(savedOffer5.getId())
                                    .employerEmail(employer.getEmail())
                                            .studentEmail(etudiantDTO.getEmail())
                                                    .selectedCvID(studentCV.getId()).build();

            InternshipApplicationResponseDTO savedApplication1 =
                    internshipApplicationService.saveInternshipApplication(internshipApplicationDTO1);

            InternshipApplicationResponseDTO savedApplication2 =
                    internshipApplicationService.saveInternshipApplication(internshipApplicationDTO2);

            InternshipApplicationResponseDTO savedApplication3 =
                    internshipApplicationService.saveInternshipApplication(internshipApplicationDTO3);

            InternshipApplicationResponseDTO savedApplication4 =
                    internshipApplicationService.saveInternshipApplication(internshipApplicationDTO4);

            InternshipApplicationResponseDTO savedApplication5 =
                    internshipApplicationService.saveInternshipApplication(internshipApplicationDTO5);

            // ---------------------------------------------
            // [11] Mise à jour des statuts des applications
            // ---------------------------------------------

            internshipApplicationService.approveInternshipApplication(
                    savedApplication1.getEmployerEmail(),
                    savedApplication1.getId()
            );
            internshipApplicationService.approveInternshipApplication(
                    savedApplication3.getEmployerEmail(),
                    savedApplication3.getId()
            );
            internshipApplicationService.rejectInternshipApplication(
                    savedApplication4.getEmployerEmail(),
                    savedApplication4.getId(),
                    "Thank you for taking the time to consider TechCorp. We wanted to let you know that we " +
                            "have chosen to move forward with a different candidate for the AI & Data Engineer position."
            );

            List<InternshipApplicationResponseDTO> allAlexandreApplications =
                    internshipApplicationService.getAllApplicationsFromStudent(etudiantDTO.getEmail());

            List<InternshipApplicationResponseDTO> allJimmyApplications =
                    internshipApplicationService.getAllApplicationsFromStudent(studentDTO.getEmail());

            List<InternshipApplicationResponseDTO> jimmyAcceptedApplications =
                    internshipApplicationService.getAllApplicationsFromStudentByStatus(
                            studentDTO.getEmail(),
                            "ACCEPTED"
                    );
            List<InternshipApplicationResponseDTO> jimmyPendingApplications =
                    internshipApplicationService.getAllApplicationsFromStudentByStatus(
                            studentDTO.getEmail(),
                            "PENDING"
                    );
            List<InternshipApplicationResponseDTO> jimmyRejectedApplications = internshipApplicationService
                    .getAllApplicationsFromStudentByStatus(
                            studentDTO.getEmail(),
                            "REJECTED"
                    );

            InternshipApplicationResponseDTO jimmyApplicationWithID2 = internshipApplicationService
                    .getApplicationByStudentAndId(
                        studentDTO.getEmail(),
                        savedApplication2.getId()
                    );

            // ---------------------------------------------
            // [12] Affichage des applications des étudiants
            // ---------------------------------------------

            System.out.println("\n=== Applications Alexandre ===");
            allAlexandreApplications.forEach((a) -> System.out.println(
                    a.getId() + " | " + a.getInternshipOfferTitle() + " | " +
                    a.getStatus() + " | " + a.getStudentEmail()
            ));

            System.out.println("\n=== Applications jimmy jammer ===");
            allJimmyApplications.forEach((a) -> System.out.println(
                    a.getId() + " | " + a.getInternshipOfferTitle() + " | " +
                    a.getStatus() + " | " + a.getStudentEmail()
            ));

            System.out.println("\n=== Application jimmy jammer (ID:2) ===");
            System.out.println(
                    jimmyApplicationWithID2.getId() + " | " +
                    jimmyApplicationWithID2.getInternshipOfferTitle() + " | " +
                    jimmyApplicationWithID2.getStatus() + " | " +
                    jimmyApplicationWithID2.getStudentEmail()
            );

            System.out.println("\n=== Applications ACCEPTED pour jimmy jammer ===");
            jimmyAcceptedApplications.forEach((a) -> System.out.println(
                    a.getId() + " | " + a.getInternshipOfferTitle() + " | " +
                    a.getStatus() + " | " + a.getStudentEmail()
            ));

            System.out.println("\n=== Applications PENDING pour jimmy jammer ===");
            jimmyPendingApplications.forEach((a) -> System.out.println(
                    a.getId() + " | " + a.getInternshipOfferTitle() + " | " +
                    a.getStatus() + " | " + a.getStudentEmail()
            ));

            System.out.println("\n=== Applications REJECTED pour jimmy jammer ===");
            jimmyRejectedApplications.forEach((a) -> System.out.println(
                    a.getId() + " | " + a.getInternshipOfferTitle() + " | " +
                    a.getStatus() + " | " + a.getStudentEmail()
            ));
        };
    }
}
