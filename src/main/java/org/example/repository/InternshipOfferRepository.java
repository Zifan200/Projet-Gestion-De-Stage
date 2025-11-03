package org.example.repository;

import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface InternshipOfferRepository extends JpaRepository<InternshipOffer, Long> {

    Optional<InternshipOffer> findInternshipOffersById(Long id);
    List<InternshipOffer> getAllByEmployerCredentialsEmail(String email);
    Optional<Set<InternshipOffer>> findInternshipOffersByEmployerId(Long employerId);
    Optional<Set<InternshipOffer>> findInternshipOffersByPublishedDate(LocalDate publishedDate);
    List<InternshipOffer> findDistinctByStatus(ApprovalStatus status);

}
