package org.example;

import org.example.model.Employer;
import org.example.model.enums.InternshipOfferStatus;
import org.example.repository.EmployerRepository;
import org.example.service.InternshipOfferService;
import org.example.service.dto.InternshipOfferListDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
public class Main {
    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(Main.class, args);

        EmployerRepository employerRepository = context.getBean(EmployerRepository.class);
        InternshipOfferService internshipOfferService = context.getBean(InternshipOfferService.class);

        // Créer un employeur
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

        // === Tests ===

        // Afficher uniquement les offres ACCEPTED du programme "Informatique"
        System.out.println("\n=== Offres ACCEPTED pour Informatique ===");
        List<InternshipOfferListDto> acceptedOffers = internshipOfferService.getOffersByProgramme("Informatique");
        acceptedOffers.forEach(o ->
                System.out.println("ID: " + o.getId() + " | " + o.getTitle() + " - " + o.getEnterpriseName()));

        // Afficher toutes les offres PENDING
        System.out.println("\n=== Offres PENDING ===");
        internshipOfferService.getPendingOffers().forEach(o ->
                System.out.println("ID: " + o.getId() + " | " + o.getTitle()));

        // Afficher toutes les offres REFUSED
        System.out.println("\n=== Offres REFUSED ===");
        internshipOfferService.getRejectedOffers().forEach(o ->
                System.out.println("ID: " + o.getId() + " | " + o.getTitle()));
    }
}
