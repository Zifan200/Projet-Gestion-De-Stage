package org.example;

import org.apache.catalina.User;
import org.example.model.Employer;
import org.example.model.UserApp;
import org.example.repository.EmployerRepository;
import org.example.repository.GestionnaireRepository;
import org.example.repository.UserAppRepository;
import org.example.service.GestionnaireService;
import org.example.service.dto.GestionnaireDTO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

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
        };
    }
}