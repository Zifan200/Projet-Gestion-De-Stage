package org.example.repository;

import org.example.model.InternshipOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface InternshipOfferRepository extends JpaRepository<InternshipOffer, Long> {
    Optional<Set<InternshipOffer>> findAllByEmployerId(Long id);
}
