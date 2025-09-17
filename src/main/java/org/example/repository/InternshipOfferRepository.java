package org.example.repository;

import org.example.model.Employer;
import org.example.model.InternshipOffer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternshipOfferRepository extends JpaRepository<InternshipOffer, Long> {



}
