package org.example.repository;

import org.example.model.InternshipApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InternshipApplicaitonRepository extends JpaRepository<InternshipApplication, Long> {
}
