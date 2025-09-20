package org.example;

import org.example.model.Employer;
import org.example.repository.EmployerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;

@SpringBootApplication
public class SimMain {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }

    @Bean
    CommandLineRunner run(EmployerRepository employerRepository) {
        return args -> {
            // just instantiate and save
            Employer employer = Employer.builder()
                    .email("test@google.com")
                    .firstName("Test")
                    .lastName("Employer")
                    .password("password")
                    .since(LocalDate.now())
                    .enterpriseName("Test Enterprise")
                    .build();

            employerRepository.save(employer);

            System.out.println("Employer created: " + employer.getEmail());

            // you can call any methods you want here
//            someCustomMethod();
        };
    }

//    private void someCustomMethod() {
//        System.out.println("Custom method executed!");
//    }
}
