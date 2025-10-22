package org.example.service;

import org.example.model.Etudiant;
import org.example.repository.EtudiantRepository;
import org.example.service.dto.student.EtudiantDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class StudentService {
    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);
    EtudiantRepository etudiantRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public StudentService(EtudiantRepository etudiantRepository) {
        this.etudiantRepository = etudiantRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public EtudiantDTO inscriptionEtudiant(EtudiantDTO etudiantDTO) {
        if(etudiantRepository.existsByCredentialsEmail(etudiantDTO.getEmail())){
            throw new RuntimeException("Email already in use");
        }
        System.out.println("service");
        Etudiant student = Etudiant
                .builder()
                .firstName(etudiantDTO.getFirstName())
                .lastName(etudiantDTO.getLastName())
                .email(etudiantDTO.getEmail())
                .password(passwordEncoder.encode(etudiantDTO.getPassword()))
                .since(LocalDate.now())
                .adresse(etudiantDTO.getAdresse())
                .phone(etudiantDTO.getPhone())
                .program(etudiantDTO.getProgram())
                .build();


        Etudiant etudiantSaved = etudiantRepository.save(student);
        logger.info("Employer created = {}", etudiantSaved.getEmail());

        return EtudiantDTO.fromEntity(etudiantSaved);
    }

}
