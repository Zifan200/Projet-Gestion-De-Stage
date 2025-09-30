package org.example.presentation;

import lombok.RequiredArgsConstructor;
import org.example.service.InternshipOfferService;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferListDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/internship-offers")
@CrossOrigin(origins = "http://localhost:5173")
public class InternshipOfferController {

    private final InternshipOfferService internshipOfferService;

    // Utiliser par le GS et les etudiants pour regarder toutes les offres sans voir tous les details
    @GetMapping("/all-offers-summary")
    public ResponseEntity<List<InternshipOfferListDto>> getAllInternshipOffersSummary() {
        List<InternshipOfferListDto> offers = internshipOfferService.getAllOffersSummary();
        if (offers.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(List.of());
        }
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipOfferResponseDto> getInternshipOfferById(@PathVariable Long id) {
        try {
            InternshipOfferResponseDto offerDto = internshipOfferService.getOfferById(id);
            return ResponseEntity.ok(offerDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // retourne les noms des programmes existants
    @GetMapping("/all-programs-name")
    public ResponseEntity<List<String>> getAllProgrammesName() {
        return ResponseEntity.ok(internshipOfferService.getAllTargetedProgrammes());
    }

    // Utiliser par le GS
    @GetMapping("/filter-by-program")
    public ResponseEntity<List<InternshipOfferListDto>> getOffersByProgramme(@RequestParam String program) {
        List<InternshipOfferListDto> filteredOffers = internshipOfferService.getOffersByProgramme(program);

        return ResponseEntity.ok(filteredOffers);
    }

    @GetMapping("/filter-by-accepted-offers")
    public ResponseEntity<List<InternshipOfferDto>> getAcceptedOffers() {
        return ResponseEntity.ok(internshipOfferService.getAcceptedOffers());
    }

    @GetMapping("/filter-by-rejected-offers")
    public ResponseEntity<List<InternshipOfferDto>> getRejectedOffers() {
        return ResponseEntity.ok(internshipOfferService.getRejectedOffers());
    }

    @GetMapping("/filter-by-pending-offers")
    public ResponseEntity<List<InternshipOfferDto>> getPendingOffers() {
        return ResponseEntity.ok(internshipOfferService.getPendingOffers());
    }

    // Utiliser pour les etudiants
    @GetMapping("/filter-by-accepted-program")
    public ResponseEntity<List<InternshipOfferListDto>> getAcceptedOffersByProgramme(@RequestParam String program) {
        List<InternshipOfferListDto> filteredOffers = internshipOfferService.getAcceptedOffersByProgramme(program);

        return ResponseEntity.ok(filteredOffers);
    }

}
