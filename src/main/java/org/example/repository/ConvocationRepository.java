package org.example.repository;

import org.example.model.Convocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConvocationRepository extends JpaRepository<Convocation, Long> {
    List<Convocation> findAllByEtudiant_Id(Long etudiantId);
    List<Convocation> findAllByEmployer_Id(Long employerId);
}
