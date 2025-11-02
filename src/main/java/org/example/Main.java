package org.example;

import org.example.model.InternshipOffer;
import org.example.model.CV;
import org.example.model.auth.Role;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.CvRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.*;
import org.example.service.dto.cv.CvResponseDTO;
import org.example.service.dto.employer.EmployerDto;
import org.example.service.dto.gestionnaire.GestionnaireDTO;
import org.example.service.dto.internship.InternshipOfferDto;
import org.example.service.dto.internship.InternshipOfferListDto;
import org.example.service.dto.internship.InternshipOfferResponseDto;
import org.example.service.dto.internshipApplication.InternshipApplicationDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.dto.student.EtudiantDTO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
public class Main {
    private final GestionnaireService gestionnaireService;
    private final EmployerService employerService;
    private final StudentService studentService;
    private final CVService cvService;
    private final InternshipOfferRepository internshipOfferRepository;

    public Main(GestionnaireService gestionnaireService, EmployerService employerService,
                StudentService studentService, CVService cvService,
                InternshipOfferRepository internshipOfferRepository) {
        this.gestionnaireService = gestionnaireService;
        this.employerService = employerService;
        this.studentService = studentService;
        this.cvService = cvService;
        this.internshipOfferRepository = internshipOfferRepository;
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

            InternshipOfferService internshipOfferService = context.getBean(InternshipOfferService.class);

            // -----------------------------
            // 3️⃣ Création d’offres de stage
            // -----------------------------
            InternshipOfferDto offer1 = InternshipOfferDto.builder()
                    .title("Développeur Java")
                    .description("Stage backend Java Spring Boot")
                    .targetedProgramme("Cinéma")
                    .employerEmail(employer.getEmail())
                    .expirationDate(LocalDate.now().plusMonths(2))
                    .startDate(LocalDate.of(2025, 2, 15))
                    .EndDate(LocalDate.of(2025, 5, 15))
                    .build();
            InternshipOfferResponseDto savedOffer1 = internshipOfferService.saveInternshipOffer(employer.getEmail(), offer1);

            InternshipOfferDto offer2 = InternshipOfferDto.builder()
                    .title("Frontend React")
                    .description("Stage développement frontend React")
                    .targetedProgramme("Informatique")
                    .employerEmail(employer.getEmail())
                    .expirationDate(LocalDate.now().plusMonths(3))
                    .startDate(LocalDate.of(2025, 9, 1))
                    .EndDate(LocalDate.of(2025, 11, 30))
                    .build();
            InternshipOfferResponseDto savedOffer2 = internshipOfferService.saveInternshipOffer(employer.getEmail(), offer2);

            InternshipOfferDto offer3 = InternshipOfferDto.builder()
                    .title("Data Analyst")
                    .description("Stage analyse de données et visualisation")
                    .targetedProgramme("Informatique")
                    .employerEmail(employer.getEmail())
                    .expirationDate(LocalDate.now().plusMonths(4))
                    .build();
            InternshipOfferResponseDto savedOffer3 = internshipOfferService.saveInternshipOffer(employer.getEmail(), offer3);

            InternshipOfferDto offer4 = InternshipOfferDto.builder()
                    .title("Soins infirmiers")
                    .description("Stage pratique soins infirmiers")
                    .targetedProgramme("Soins infirmiers")
                    .employerEmail(employer.getEmail())
                    .expirationDate(LocalDate.now().plusMonths(2))
                    .build();
            InternshipOfferResponseDto savedOffer4 = internshipOfferService.saveInternshipOffer(employer.getEmail(), offer4);

            InternshipOfferDto offer5 = InternshipOfferDto.builder()
                    .title("Frontend Angular")
                    .description("Stage développement frontend Angular")
                    .targetedProgramme("Informatique")
                    .employerEmail(employer.getEmail())
                    .expirationDate(LocalDate.now().plusMonths(1))
                    .build();
            InternshipOfferResponseDto savedOffer5 = internshipOfferService.saveInternshipOffer(employer.getEmail(), offer5);

            InternshipOfferDto offer6 = InternshipOfferDto.builder()
                    .title("AI & Data Engineer")
                    .description("Experience required in Python and Machine Learning algorithms")
                    .targetedProgramme("Informatique")
                    .employerEmail(employer.getEmail())
                    .expirationDate(LocalDate.now().plusMonths(1))
                    .build();
            InternshipOfferResponseDto savedOffer6 = internshipOfferService.saveInternshipOffer(employer.getEmail(), offer6);

            // -----------------------------
            // 3️⃣1️⃣ Tester getIntershipOfferSession
            // -----------------------------
            for (InternshipOfferResponseDto savedOffer : List.of(savedOffer1, savedOffer2, savedOffer3, savedOffer4)) {
                if (savedOffer.getStartDate() != null) {
                    InternshipOffer offerEntity = internshipOfferRepository.findById(savedOffer.getId()).get();
                    String session = internshipOfferService.getIntershipOfferSession(offerEntity.getStartDate());
                    System.out.println("Session pour l'offre '" + savedOffer.getTitle() + "' : " + session);
                }
            }

            // -----------------------------
            // 4️⃣ Création étudiant + CV
            // -----------------------------
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

            MultipartFile file = new MockMultipartFile(
                    "file",
                    "cv_test.txt",
                    "application/pdf",
                    "Mon CV de test".getBytes()
            );
            CvResponseDTO cvResponseDTO = cvService.addCv(etudiantDTO.getEmail(), file);
            cvService.approveCv(cvResponseDTO.getId());

            // -----------------------------
            // 5️⃣ Mise à jour des statuts des offres
            // -----------------------------
            internshipOfferService.updateOfferStatus(savedOffer1.getId(), ApprovalStatus.ACCEPTED, "je taimes");
            internshipOfferService.updateOfferStatus(savedOffer2.getId(), ApprovalStatus.ACCEPTED, "t cool");
            internshipOfferService.updateOfferStatus(savedOffer4.getId(), ApprovalStatus.REJECTED, "pas intéressant");
            internshipOfferService.updateOfferStatus(savedOffer5.getId(), ApprovalStatus.ACCEPTED, "");
            internshipOfferService.updateOfferStatus(savedOffer6.getId(), ApprovalStatus.ACCEPTED, "");

            // -----------------------------
            // 6️⃣ Affichage offres
            // -----------------------------
            List<InternshipOfferListDto> allOffers = internshipOfferService.getAllOffersSummary();
            allOffers.forEach(o -> System.out.println(
                    "ID: " + o.getId() + " | " + o.getTitle() +
                            " - " + o.getEnterpriseName() +
                            " (Expiration: " + o.getExpirationDate() + ")"
            ));

            // -----------------------------
            // 7️⃣ Création candidatures
            // -----------------------------
            InternshipApplicationService internshipApplicationService = context.getBean(InternshipApplicationService.class);
            CvRepository cvRepository = context.getBean(CvRepository.class);

            byte[] bytes = new byte[9];
            CV studentCV = CV.builder()
                    .etudiant(EtudiantDTO.toEntity(etudiantDTO))
                    .data(bytes)
                    .fileName("My Cv")
                    .fileSize(1L)
                    .fileType("pdf")
                    .reason("")
                    .uploadedAt(LocalDateTime.now())
                    .status(ApprovalStatus.ACCEPTED)
                    .build();
            cvRepository.save(studentCV);

            InternshipApplicationDTO internshipApplicationDTO = InternshipApplicationDTO.builder()
                    .internshipOfferId(savedOffer1.getId())
                    .employerEmail(employer.getEmail())
                    .studentEmail(etudiantDTO.getEmail())
                    .selectedCvID(studentCV.getId())
                    .build();

            InternshipApplicationResponseDTO savedInternshipApplication = internshipApplicationService.saveInternshipApplication(internshipApplicationDTO);
        };
    }
}
