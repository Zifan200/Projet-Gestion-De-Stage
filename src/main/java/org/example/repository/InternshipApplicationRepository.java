package org.example.repository;

import org.example.model.InternshipApplication;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;
import org.example.service.dto.student.EtudiantDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Long> {


    List<InternshipApplication> findAllByStudentCredentialsEmail(String studentEmail);
    List<InternshipApplication> findAllByStudentCredentialsEmailAndStatus(String studentEmail, ApprovalStatus status);
    List<InternshipApplication> findAllByStatus(ApprovalStatus status);

    List<InternshipApplication> getAllByOfferEmployerCredentialsEmail(String email);
    List<InternshipApplication> findAllByOfferId(Long id);
    List<InternshipApplication> findAllByOfferAndStatus(InternshipOffer offer, ApprovalStatus status);

    List<InternshipApplication> findAllByPostInterviewStatusAndEtudiantStatusAndClaimedIsFalse(
            ApprovalStatus postInterviewStatus, ApprovalStatus etudiantStatus);
}
