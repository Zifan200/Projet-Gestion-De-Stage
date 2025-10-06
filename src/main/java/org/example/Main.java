package org.example;

import org.apache.catalina.User;
import org.example.model.Employer;
import org.example.model.UserApp;
import org.example.model.enums.InternshipOfferStatus;
import org.example.repository.EmployerRepository;
import org.example.repository.GestionnaireRepository;
import org.example.repository.UserAppRepository;
import org.example.service.GestionnaireService;
import org.example.service.InternshipOfferService;
import org.example.service.dto.GestionnaireDTO;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferListDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@SpringBootApplication
public class Main {

    private final GestionnaireService gestionnaireService;
    EmployerRepository employerRepository;
    InternshipOfferService internshipOfferService;

    public Main(GestionnaireService gestionnaireService,
                EmployerRepository employerRepository,
                InternshipOfferService internshipOfferService)
    {
        this.gestionnaireService = gestionnaireService;
        this.employerRepository = employerRepository;
        this.internshipOfferService = internshipOfferService;
    }

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }

    @Bean
    CommandLineRunner commandLineRunner( ) {
        return args -> {
            GestionnaireDTO admin = GestionnaireDTO.builder()
                    .firstName("François")
                    .lastName("Lacoursière")
                    .email("francoislacoursiere@test.com")
                    .password("Test123!")
                    .phone("5144381800")
                    .build();

            gestionnaireService.saveGestionnaire(admin);

            // Créer un employeur
            Employer employer = Employer.builder()
                    .firstName("Alice")
                    .lastName("Dupont")
                    .email("alice@example.com")
                    .password("Password123!")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .since(LocalDate.of(2020, 1, 1))
                    .enterpriseName("TechCorp")
                    .phone("123-456-7890")
                    .build();

            employerRepository.save(employer);

            // Créer des offres de stage
            InternshipOfferDto offer1 = InternshipOfferDto.builder()
                    .title("Développeur Java")
                    .description("Stage backend Java Spring Boot")
                    .targetedProgramme("Informatique")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(2))
                    .build();
            InternshipOfferResponseDto savedOffer1 = internshipOfferService.saveInternshipOffer(
                    "alice@example.com", offer1);

            InternshipOfferDto offer2 = InternshipOfferDto.builder()
                    .title("Frontend React")
                    .description("Stage développement frontend React")
                    .targetedProgramme("Informatique")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(3))
                    .build();
            InternshipOfferResponseDto savedOffer2 = internshipOfferService.saveInternshipOffer(
                    "alice@example.com", offer2);

            InternshipOfferDto offer3 = InternshipOfferDto.builder()
                    .title("Data Analyst")
                    .description("Stage analyse de données et visualisation")
                    .targetedProgramme("Informatique")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(4))
                    .build();
            InternshipOfferResponseDto savedOffer3 = internshipOfferService.saveInternshipOffer(
                    "alice@example.com", offer3);

            InternshipOfferDto offer4 = InternshipOfferDto.builder()
                    .title("Soins infirmiers")
                    .description("Stage pratique soins infirmiers")
                    .targetedProgramme("Soins infirmiers")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(2))
                    .build();
            InternshipOfferResponseDto savedOffer4 = internshipOfferService.saveInternshipOffer(
                    "alice@example.com", offer4);

            // Mettre à jour les statuts
            internshipOfferService.updateOfferStatus(savedOffer1.getId(), InternshipOfferStatus.ACCEPTED);
            internshipOfferService.updateOfferStatus(savedOffer2.getId(), InternshipOfferStatus.ACCEPTED);
            internshipOfferService.updateOfferStatus(savedOffer3.getId(), InternshipOfferStatus.PENDING);
            internshipOfferService.updateOfferStatus(savedOffer4.getId(), InternshipOfferStatus.REJECTED);

            // === Test getAllOffersSummary ===
            System.out.println("=== Toutes les offres (résumé) ===");
            List<InternshipOfferListDto> allOffers = internshipOfferService.getAllOffersSummary();
            allOffers.forEach(o ->
                    System.out.println("ID: " + o.getId() + " | " + o.getTitle() +
                            " - " + o.getEnterpriseName() +
                            " (Expiration: " + o.getExpirationDate() + ")")
            );
        };
    }
}