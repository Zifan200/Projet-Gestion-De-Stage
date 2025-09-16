package org.example;

import org.apache.catalina.User;
import org.example.model.Employer;
import org.example.model.UserApp;
import org.example.repository.EmployerRepository;
import org.example.repository.UserAppRepository;
import org.example.service.UserService;
import org.example.service.dto.EtudiantDTO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

@SpringBootApplication
public class Main {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }

    @Bean
    CommandLineRunner demo(UserService userService) {
        return args -> {
            EtudiantDTO dto = new EtudiantDTO();
            dto.setNom("Dupont");
            dto.setPrenom("Jean");
            dto.setCourriel("jean.dupont@example.com");
            dto.setTelephone("5141234567");
            dto.setAdresse("123 rue Principale");
            dto.setProgramme("Informatique");
            dto.setAge(22);
            dto.setMotDePasse("Password123!");

            try {
                EtudiantDTO saved = userService.inscriptionEtudiant(dto);
                System.out.println("✅ Étudiant inscrit avec succès !");
                System.out.println("ID : " + saved.getId());
                System.out.println("Nom : " + saved.getNom());
                System.out.println("Prénom : " + saved.getPrenom());
                System.out.println("Courriel : " + saved.getCourriel());
                System.out.println("Téléphone : " + saved.getTelephone());
                System.out.println("Adresse : " + saved.getAdresse());
                System.out.println("Programme : " + saved.getProgramme());
                System.out.println("Âge : " + saved.getAge());
                System.out.println("Mot de passe (hashé) : " + saved.getMotDePasse());
            } catch (Exception e) {
                System.out.println("❌ Erreur : " + e.getMessage());
            }
        };
    }
}
