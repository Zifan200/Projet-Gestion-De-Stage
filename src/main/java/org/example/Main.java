package org.example;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.example.model.CV;
import org.example.model.auth.Role;
import org.example.model.enums.ApprovalStatus;
import org.example.repository.CvRepository;
import org.example.service.*;
import org.example.service.dto.cv.CvResponseDTO;
import org.example.service.dto.employer.EmployerDto;
import org.example.service.dto.gestionnaire.GestionnaireDTO;
import org.example.service.dto.internship.InternshipOfferDto;
import org.example.service.dto.internship.InternshipOfferResponseDto;
import org.example.service.dto.internshipApplication.InternshipApplicationDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.dto.student.EtudiantDTO;
import org.example.service.dto.teacher.TeacherDTO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@SpringBootApplication
public class Main {

    private final GestionnaireService gestionnaireService;
    private final EmployerService employerService;
    private final StudentService studentService;
    private final CVService cvService;
    private final TeacherService teacherService;

    public Main(
        GestionnaireService gestionnaireService,
        EmployerService employerService,
        StudentService studentService,
        CVService cvService,
        TeacherService teacherService
    ) {
        this.gestionnaireService = gestionnaireService;
        this.employerService = employerService;
        this.studentService = studentService;
        this.cvService = cvService;
        this.teacherService = teacherService;
    }

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }

    @Bean
    CommandLineRunner commandLineRunner(ApplicationContext context) {
        return args -> {
            InternshipOfferService internshipOfferService = context.getBean(
                InternshipOfferService.class
            );
            InternshipApplicationService internshipApplicationService =
                context.getBean(InternshipApplicationService.class);
            CvRepository cvRepository = context.getBean(CvRepository.class);

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

            // -----------------------------
            // 1.5️⃣ Création d'un enseignant
            // -----------------------------
            TeacherDTO teacher = TeacherDTO.builder()
                .firstName("Marie")
                .lastName("Tremblay")
                .email("marie.tremblay@college.com")
                .password("Test123!")
                .phone("514-555-1234")
                .department("Informatique")
                .specialization("Développement logiciel")
                .since(LocalDate.of(2015, 9, 1))
                .build();
            teacherService.saveTeacher(teacher);

            System.out.println(
                "✅ Enseignant créé : " +
                    teacher.getFirstName() +
                    " " +
                    teacher.getLastName()
            );

            // -----------------------------
            // 2️⃣ Création de l'employeur
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

            // -----------------------------
            // 3️⃣ Création d'offres de stage
            // -----------------------------

            InternshipOfferResponseDto offer1 =
                internshipOfferService.saveInternshipOffer(
                    employer.getEmail(),
                    InternshipOfferDto.builder()
                        .title("Développeur Java")
                        .description("Stage backend Java Spring Boot")
                        .targetedProgramme("Informatique")
                        .expirationDate(LocalDate.now().plusMonths(2))
                        .startDate(LocalDate.of(2025, 2, 15))
                        .EndDate(LocalDate.of(2025, 5, 15))
                        .employerEmail(employer.getEmail())
                        .build()
                );

            InternshipOfferResponseDto offer2 =
                internshipOfferService.saveInternshipOffer(
                    employer.getEmail(),
                    InternshipOfferDto.builder()
                        .title("Frontend React")
                        .description("Stage ReactJS avec API REST")
                        .targetedProgramme("Informatique")
                        .expirationDate(LocalDate.now().plusMonths(2))
                        .startDate(LocalDate.of(2025, 3, 1))
                        .EndDate(LocalDate.of(2025, 6, 1))
                        .employerEmail(employer.getEmail())
                        .build()
                );

            InternshipOfferResponseDto offer3 =
                internshipOfferService.saveInternshipOffer(
                    employer.getEmail(),
                    InternshipOfferDto.builder()
                        .title("Data Analyst")
                        .description("Stage d'analyse de données avec Python")
                        .targetedProgramme("Informatique")
                        .expirationDate(LocalDate.now().plusMonths(2))
                        .startDate(LocalDate.of(2025, 4, 1))
                        .EndDate(LocalDate.of(2025, 7, 1))
                        .employerEmail(employer.getEmail())
                        .build()
                );

            InternshipOfferResponseDto offer4 =
                internshipOfferService.saveInternshipOffer(
                    employer.getEmail(),
                    InternshipOfferDto.builder()
                        .title("Junior Frontend Dev")
                        .description("Stage: ReactJS avec API REST")
                        .targetedProgramme("Informatique")
                        .expirationDate(LocalDate.now().plusMonths(2))
                        .startDate(LocalDate.of(2025, 3, 1))
                        .EndDate(LocalDate.of(2025, 6, 1))
                        .employerEmail(employer.getEmail())
                        .build()
                );
            internshipOfferService.updateOfferStatus(
                offer1.getId(),
                ApprovalStatus.ACCEPTED,
                ""
            );
            internshipOfferService.updateOfferStatus(
                offer2.getId(),
                ApprovalStatus.ACCEPTED,
                ""
            );
            internshipOfferService.updateOfferStatus(
                offer3.getId(),
                ApprovalStatus.ACCEPTED,
                ""
            );
            internshipOfferService.updateOfferStatus(
                offer4.getId(),
                ApprovalStatus.ACCEPTED,
                ""
            );

            // -----------------------------
            // 4️⃣ Création étudiant + CV
            // -----------------------------
            EtudiantDTO etudiantDTO = studentService.inscriptionEtudiant(
                EtudiantDTO.builder()
                    .firstName("Alexandre")
                    .lastName("Nowell")
                    .email("alexandre@example.com")
                    .phone("514-999-9999")
                    .adresse("Pôle Nord")
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
            CvResponseDTO cvResponseDTO = cvService.addCv(
                etudiantDTO.getEmail(),
                file
            );
            cvService.approveCv(cvResponseDTO.getId());

            // -----------------------------
            // 5️⃣ Création candidatures avec approvalStatus hardcodé APPROVED
            // -----------------------------
            byte[] bytes = new byte[9];

            CV studentCV = CV.builder()
                .etudiant(EtudiantDTO.toEntity(etudiantDTO))
                .data("cv".getBytes())
                .fileName("cv_test")
                .fileSize(1L)
                .fileType("pdf")
                .uploadedAt(LocalDateTime.now())
                .status(ApprovalStatus.ACCEPTED)
                .build();
            cvRepository.save(studentCV);

            // Créer candidature
            InternshipApplicationDTO internshipApplicationDTO =
                InternshipApplicationDTO.builder()
                    .internshipOfferId(offer1.getId())
                    .employerEmail(employer.getEmail())
                    .studentEmail(etudiantDTO.getEmail())
                    .selectedCvID(studentCV.getId())
                    .build();

            InternshipApplicationResponseDTO savedInternshipApplication =
                internshipApplicationService.saveInternshipApplication(
                    internshipApplicationDTO
                );

            // Hardcoder le statut employeur à APPROVED
            var appEntity =
                internshipApplicationService.approveInternshipApplication(
                    employer.getEmail(),
                    savedInternshipApplication.getId()
                );

            // -----------------------------
            // 5️⃣ Candidature 1 : Acceptée par étudiant
            // -----------------------------
            InternshipApplicationResponseDTO app1 =
                internshipApplicationService.saveInternshipApplication(
                    InternshipApplicationDTO.builder()
                        .internshipOfferId(offer1.getId())
                        .employerEmail(employer.getEmail())
                        .studentEmail(etudiantDTO.getEmail())
                        .selectedCvID(studentCV.getId())
                        .build()
                );

            internshipApplicationService.approveInternshipApplication(
                employer.getEmail(),
                app1.getId()
            );
            internshipApplicationService.acceptOfferByStudent(
                etudiantDTO.getEmail(),
                app1.getId()
            );

            System.out.println(
                "✅ Candidature 1 (Développeur Java) : ACCEPTÉE par l'étudiant"
            );

            // -----------------------------
            // 6️⃣ Candidature 2 : Refusée par étudiant
            // -----------------------------
            InternshipApplicationResponseDTO app2 =
                internshipApplicationService.saveInternshipApplication(
                    InternshipApplicationDTO.builder()
                        .internshipOfferId(offer2.getId())
                        .employerEmail(employer.getEmail())
                        .studentEmail(etudiantDTO.getEmail())
                        .selectedCvID(studentCV.getId())
                        .build()
                );

            internshipApplicationService.approveInternshipApplication(
                employer.getEmail(),
                app2.getId()
            );
            internshipApplicationService.rejectOfferByStudent(
                etudiantDTO.getEmail(),
                app2.getId(),
                "Je préfère une autre offre"
            );

            System.out.println(
                "❌ Candidature 2 (Frontend React) : REFUSÉE par l'étudiant"
            );

            // -----------------------------
            // 7️⃣ Candidature 3 : Pending (employeur accepté, étudiant n'a rien fait)
            // -----------------------------
            InternshipApplicationResponseDTO app3 =
                internshipApplicationService.saveInternshipApplication(
                    InternshipApplicationDTO.builder()
                        .internshipOfferId(offer3.getId())
                        .employerEmail(employer.getEmail())
                        .studentEmail(etudiantDTO.getEmail())
                        .selectedCvID(studentCV.getId())
                        .build()
                );

            internshipApplicationService.approveInternshipApplication(
                employer.getEmail(),
                app3.getId()
            );

            System.out.println(
                "⏳ Candidature 3 (Data Analyst) : EN ATTENTE (étudiant n'a rien fait)"
            );

            PreLoadedActors loader = PreLoadedActors.getInstance(context);
            List<EtudiantDTO> generatedStudents = loader.genStudents(4);
            List<EmployerDto> generatedEmployers = loader.genEmployers(4);
            List<InternshipOfferDto> generatedOffers =
                loader.genInternshipOffers(6);

            for (EtudiantDTO generatedStudentDTO : generatedStudents) {
                System.out.println(generatedStudentDTO);
                loader.associateEmptyCvToStudent(generatedStudentDTO);
            }
        };
    }
}
