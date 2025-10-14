package org.example;

import org.example.model.Employer;
import org.example.model.enums.InternshipOfferStatus;
import org.example.repository.EmployerRepository;
import org.example.service.GestionnaireService;
import org.example.service.InternshipOfferService;
import org.example.service.dto.GestionnaireDTO;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferListDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
public class Main {
    private final GestionnaireService gestionnaireService;

    public Main(GestionnaireService gestionnaireService) {
        this.gestionnaireService = gestionnaireService;
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
            EmployerRepository employerRepository = context.getBean(EmployerRepository.class);
            InternshipOfferService internshipOfferService = context.getBean(InternshipOfferService.class);

            Employer employer = Employer.builder()
                    .firstName("Alice")
                    .lastName("Dupont")
                    .email("alice@example.com")
                    .password("password")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .since(LocalDate.of(2020, 1, 1))
                    .enterpriseName("TechCorp")
                    .phone("123-456-7890")
                    .build();
            employerRepository.save(employer);
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

            // -----------------------------
            // 4️⃣ Mise à jour des statuts
            // -----------------------------
            internshipOfferService.updateOfferStatus(savedOffer1.getId(), InternshipOfferStatus.ACCEPTED, "je taimes");
            internshipOfferService.updateOfferStatus(savedOffer2.getId(), InternshipOfferStatus.ACCEPTED, "t cool");
            internshipOfferService.updateOfferStatus(savedOffer4.getId(), InternshipOfferStatus.REJECTED, "pas intéressant");

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
        };
    }
}
