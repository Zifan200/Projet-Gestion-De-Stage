package org.example.repository;

import org.example.model.Etudiant;
import org.example.service.dto.student.EtudiantDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    boolean existsByCredentialsEmail(String email);
    Optional<Etudiant> findByCredentialsEmail(String email);
    List<Etudiant> findByApplicationsIsNotEmpty();
}
