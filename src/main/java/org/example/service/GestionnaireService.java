package org.example.service;

import org.example.model.Gestionnaire;
import org.example.repository.GestionnaireRepository;
import org.example.service.dto.gestionnaire.GestionnaireDTO;
import org.example.service.exception.DuplicateUserException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GestionnaireService {

    private static final Logger logger = LoggerFactory.getLogger(GestionnaireService.class);
    private final GestionnaireRepository gestionnaireRepository;
    private final PasswordEncoder passwordEncoder;

    public GestionnaireService(GestionnaireRepository gestionnaireRepository, PasswordEncoder passwordEncoder) {
        this.gestionnaireRepository = gestionnaireRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public GestionnaireDTO saveGestionnaire(GestionnaireDTO gestionnaireDTO) {
        if (gestionnaireRepository.existsByCredentialsEmail(gestionnaireDTO.getEmail())) {
            throw new DuplicateUserException("Le courriel " + gestionnaireDTO.getEmail() + " est déjà utilisé. " +
                    "Avez-vous oublié votre mot de passe ?");
        }
        Gestionnaire nouveauGestionnaire =  Gestionnaire
                .builder()
                .firstName(gestionnaireDTO.getFirstName())
                .lastName(gestionnaireDTO.getLastName())
                .email(gestionnaireDTO.getEmail())
                .password(passwordEncoder.encode(gestionnaireDTO.getPassword()))
                .phone(gestionnaireDTO.getPhone())
                .since(gestionnaireDTO.getSince())
                .build();

        Gestionnaire gestionnaireSaved = gestionnaireRepository.save(nouveauGestionnaire);
        logger.info("Gestionnaire saved = {}", gestionnaireSaved.getEmail());

       return GestionnaireDTO.fromEntity(gestionnaireSaved);
    }
}
