package org.example.repository;

import org.example.model.Gestionnaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GestionnaireRepository extends JpaRepository<Gestionnaire, Long> {
    boolean existsByCredentialsEmail(String email);
    Optional<Gestionnaire> findByCredentialsEmail(String email);

}
