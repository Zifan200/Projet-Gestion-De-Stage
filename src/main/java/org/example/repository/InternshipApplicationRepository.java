package org.example.repository;

import org.example.model.InternshipApplication;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Long> {

    Optional<InternshipApplication> findById(Long id);

    List<InternshipApplication> findAllBy();
    List<InternshipApplication> findAllByStudentEmail(String studentEmail);
    List<InternshipApplication> findAllByStatus(ApprovalStatus status);

    InternshipApplication findByIdAndOffer_Employer_Email(Long id, String email);
    List<InternshipApplication> findAllByOffer_EmployerEmail(String email);
    List<InternshipApplication> findAllByOffer(InternshipOffer offer);
    List<InternshipApplication> findAllByOfferAndStatus(InternshipOffer offer, ApprovalStatus status);
}
