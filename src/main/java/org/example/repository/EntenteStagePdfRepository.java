package org.example.repository;

import org.example.model.EntenteStagePdf;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EntenteStagePdfRepository extends JpaRepository<EntenteStagePdf, Long> {
    Optional<EntenteStagePdf> findById(Long id);
}
