package org.example;

import org.example.model.Employer;
import org.example.repository.EmployerRepository;
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

        // Créer 3 offres de stage avec programmes différents
        String[] titles = {"Développeur Java", "Frontend React", "Data Analyst"};
        String[] descriptions = {
                "Stage backend Java Spring Boot",
                "Stage développement frontend React",
                "Stage analyse de données et visualisation"
        };
        String[] programmes = {"Informatique", "Informatique", "Science de la nature"};

        for (int i = 0; i < 3; i++) {
            InternshipOfferDto offerDto = InternshipOfferDto.builder()
                    .title(titles[i])
                    .description(descriptions[i])
                    .targetedProgramme(programmes[i])
                    .employerEmail("alice@example.com")
                    .expirationDate(LocalDate.now().plusMonths(2 + i))
                    .build();

            internshipOfferService.saveInternshipOffer(offerDto);
        }

        // Afficher toutes les offres (comme un étudiant)
        System.out.println("=== Toutes les offres de stage ===");
        List<InternshipOfferListDto> allOffers = internshipOfferService.getAllOffers();
        allOffers.forEach(o -> System.out.println("ID: " + o.getId() + " | " + o.getTitle() + " - " + o.getEnterpriseName()));

        // Filtrage par programme (exemple : Informatique)
        String programmeFilter = "Informatique";
        System.out.println("\n=== Offres filtrées par programme : " + programmeFilter + " ===");
        List<InternshipOfferListDto> filteredOffers = internshipOfferService.getOffersByProgramme(programmeFilter);
        if (filteredOffers.isEmpty()) {
            System.out.println("Aucune offre disponible pour ce programme.");
        } else {
            filteredOffers.forEach(o -> System.out.println("ID: " + o.getId() + " | " + o.getTitle() + " - " + o.getEnterpriseName()));
        }

        // Afficher les détails complets pour chaque offre
        System.out.println("\n=== Détails des offres ===");
        allOffers.forEach(o -> {
            InternshipOfferResponseDto details = internshipOfferService.getOfferById(o.getId());
            System.out.println("\nTitre: " + details.getTitle());
            System.out.println("Description: " + details.getDescription());
            System.out.println("Programme visé: " + details.getTargetedProgramme());
            System.out.println("Email de l'employer: " + details.getEmployerEmail());
            System.out.println("Date limite: " + details.getExpirationDate());
        });
    }
}
