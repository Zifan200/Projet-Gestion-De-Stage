package org.example.repository;

import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface InternshipOfferRepository extends JpaRepository<InternshipOffer, Long> {


    List<InternshipOffer> findInternshipOfferByPublishedDate(LocalDateTime publishedDate);
}
