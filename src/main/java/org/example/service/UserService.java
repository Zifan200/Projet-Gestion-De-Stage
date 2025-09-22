package org.example.service;

import org.example.model.Etudiant;
import org.example.repository.EtudiantRepository;
import org.example.service.dto.EtudiantDTO;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    EtudiantRepository etudiantRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(EtudiantRepository etudiantRepository) {
        this.etudiantRepository = etudiantRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public EtudiantDTO inscriptionEtudiant(EtudiantDTO etudiantDTO) {
        if(etudiantRepository.existsByCourriel(etudiantDTO.getCourriel())){
            throw new RuntimeException("Email already in use");
        }
        System.out.println("service");
        Etudiant etudiant = EtudiantDTO.toEntity(etudiantDTO);

        etudiant.setMotDePasse(passwordEncoder.encode(etudiantDTO.getMotDePasse()));

        Etudiant etudiantSaved = etudiantRepository.save(etudiant);
        System.out.println("service marche");


        return EtudiantDTO.fromEntity(etudiantSaved);
    }

}
