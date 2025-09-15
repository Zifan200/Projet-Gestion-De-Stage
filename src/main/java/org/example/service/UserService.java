package org.example.service;

import org.example.model.Etudiant;
import org.example.repository.EtudiantRepository;
import org.example.service.dto.EtudiantDTO;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    EtudiantRepository etudiantRepository;


    public UserService(EtudiantRepository etudiantRepository) {
        this.etudiantRepository = etudiantRepository;
    }

    public EtudiantDTO inscriptionEtudiant(EtudiantDTO etudiantDTO) {
        if(etudiantRepository.existsByCourriel(etudiantDTO.getCourriel())){
            throw new RuntimeException("Email already in use");
        }

        Etudiant etudiant = etudiantRepository.save(EtudiantDTO.toEntity(etudiantDTO));

        return EtudiantDTO.fromEntity(etudiant);
    }

}
