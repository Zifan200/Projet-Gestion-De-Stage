package org.example.repository;

import org.example.model.CV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CvRepository extends JpaRepository<CV, Long> {
    Optional<CV> findByEtudiantId(Long etudiantId);
    List<CV> findAllByEtudiantId(Long etudiantId);
}