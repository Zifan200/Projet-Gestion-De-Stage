package org.example.repository;

import org.example.model.InternshipRecommendation;
import org.example.model.enums.PriorityCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipRecommendationRepository extends JpaRepository<InternshipRecommendation, Long> {

    // Trouver toutes les recommandations pour un étudiant
    List<InternshipRecommendation> findAllByStudentId(Long studentId);

    // Trouver toutes les recommandations pour un étudiant, triées par priorité
    @Query("SELECT r FROM InternshipRecommendation r WHERE r.student.id = :studentId ORDER BY " +
           "CASE r.priorityCode " +
           "WHEN 'GOLD' THEN 1 " +
           "WHEN 'BLUE' THEN 2 " +
           "WHEN 'GREEN' THEN 3 " +
           "END")
    List<InternshipRecommendation> findAllByStudentIdOrderedByPriority(@Param("studentId") Long studentId);

    // Trouver une recommandation spécifique par étudiant et offre
    Optional<InternshipRecommendation> findByStudentIdAndOfferId(Long studentId, Long offerId);

    // Trouver toutes les recommandations pour une offre
    List<InternshipRecommendation> findAllByOfferId(Long offerId);

    // Trouver les recommandations créées par un gestionnaire
    List<InternshipRecommendation> findAllByGestionnaireId(Long gestionnaireId);

    // Compter les recommandations d'un certain code de priorité pour un étudiant
    Long countByStudentIdAndPriorityCode(Long studentId, PriorityCode priorityCode);

    // Trouver toutes les recommandations d'un certain code de priorité pour un étudiant
    List<InternshipRecommendation> findAllByStudentIdAndPriorityCode(Long studentId, PriorityCode priorityCode);

    // Vérifier si une recommandation existe déjà
    boolean existsByStudentIdAndOfferId(Long studentId, Long offerId);
}
