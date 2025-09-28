package org.example;

import org.example.model.Employer;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipOfferRepository;
import org.example.service.InternshipOfferService;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferListDto;
import org.example.service.dto.InternshipOfferResponseDto;
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

        // Créer 3 offres de stage
        String[] titles = {"Développeur Java", "Frontend React", "Data Analyst"};
        String[] descriptions = {
                "Stage backend Java Spring Boot",
                "Stage développement frontend React",
                "Stage analyse de données et visualisation"
        };

        for (int i = 0; i < 3; i++) {
            InternshipOfferDto offerDto = InternshipOfferDto.builder()
                    .title(titles[i])
                    .description(descriptions[i])
                    .targetedProgramme("Informatique")
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(2 + i))
                    .build();

            internshipOfferService.saveInternshipOffer(offerDto);
        }

        // Afficher la liste des offres (comme un étudiant)
        System.out.println("=== Liste des offres de stage ===");
        List<InternshipOfferListDto> offersList = internshipOfferService.getAllOffers();
        offersList.forEach(o -> System.out.println("ID: " + o.getId() + " | " + o.getTitle() + " - " + o.getEnterpriseName()));

        System.out.println("\n=== Détails des offres ===");
        for (InternshipOfferListDto offerListDto : offersList) {
            InternshipOfferResponseDto details = internshipOfferService.getOfferById(offerListDto.getId());
            System.out.println("\nTitre: " + details.getTitle());
            System.out.println("Description: " + details.getDescription());
            System.out.println("Programme visé: " + details.getTargetedProgramme());
            System.out.println("Email de l'employer: " + details.getEmployerEmail());
            System.out.println("Date limite: " + details.getExpirationDate());
        }
    }
}
