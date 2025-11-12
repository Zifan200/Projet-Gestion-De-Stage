package org.example.presentation;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.model.enums.ApprovalStatus;
import org.example.service.InternshipOfferService;
import org.example.service.UserAppService;
import org.example.service.dto.internship.InternshipOfferListDto;
import org.example.service.dto.internship.InternshipOfferResponseDto;
import org.example.utils.JwtTokenUtils;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/internship-offers")
@CrossOrigin(origins = "http://localhost:5173")
public class InternshipOfferController {

    private final InternshipOfferService internshipOfferService;
    private final UserAppService userAppService;

    // Utiliser par le GS pour regarder toutes les offres sans voir tous les details
    @GetMapping("/all-offers-summary")
    public ResponseEntity<
        List<InternshipOfferListDto>
    > getAllInternshipOffersSummary() {
        List<InternshipOfferListDto> offers =
            internshipOfferService.getAllOffersSummary();
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/employer")
    public ResponseEntity<
        List<InternshipOfferListDto>
    > getAllEmployerInternshipOffersSummary(HttpServletRequest request) {
        String email = userAppService
            .getMe(JwtTokenUtils.getTokenFromRequest(request))
            .getEmail();
        List<InternshipOfferListDto> offers =
            internshipOfferService.getAllOffersSummaryFromEmployer(email);
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipOfferResponseDto> getInternshipOfferById(
        @PathVariable Long id
    ) {
        try {
            InternshipOfferResponseDto offerDto =
                internshipOfferService.getOfferById(id);
            return ResponseEntity.ok(offerDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // retourne les noms des programmes existants
    @GetMapping("/all-programs-name")
    public ResponseEntity<List<String>> getAllProgrammesName() {
        return ResponseEntity.ok(
            internshipOfferService.getAllTargetedProgrammes()
        );
    }

    // Utiliser par le GS
    @GetMapping("/filter-by-program")
    public ResponseEntity<List<InternshipOfferListDto>> getOffersByProgramme(
        @RequestParam String program
    ) {
        List<InternshipOfferListDto> filteredOffers =
            internshipOfferService.getOffersByProgramme(program);

        return ResponseEntity.ok(filteredOffers);
    }

    @GetMapping("/filter-by-accepted-offers")
    public ResponseEntity<List<InternshipOfferListDto>> getAcceptedOffers() {
        return ResponseEntity.ok(internshipOfferService.getAcceptedOffers());
    }

    @GetMapping("/filter-by-accepted-offers-with-priority")
    public ResponseEntity<
        List<org.example.service.dto.internship.InternshipOfferWithPriorityDto>
    > getAcceptedOffersWithPriority(HttpServletRequest request) {
        // Extraire l'email de l'utilisateur connecté depuis le token
        String email = userAppService
            .getMe(JwtTokenUtils.getTokenFromRequest(request))
            .getEmail();

        return ResponseEntity.ok(
            internshipOfferService.getAcceptedOffersWithPriorityByEmail(email)
        );
    }

    @GetMapping("/filter-by-rejected-offers")
    public ResponseEntity<List<InternshipOfferListDto>> getRejectedOffers() {
        return ResponseEntity.ok(internshipOfferService.getRejectedOffers());
    }

    @GetMapping("/filter-by-pending-offers")
    public ResponseEntity<List<InternshipOfferListDto>> getPendingOffers() {
        return ResponseEntity.ok(internshipOfferService.getPendingOffers());
    }

    @GetMapping("/filter-by-accepted-program")
    public ResponseEntity<
        List<InternshipOfferListDto>
    > getAcceptedOffersByProgramme(@RequestParam String program) {
        List<InternshipOfferListDto> filteredOffers =
            internshipOfferService.getAcceptedOffersByProgramme(program);
        return ResponseEntity.ok(filteredOffers);
    }

    @PostMapping("/{id}/update-status")
    public ResponseEntity<InternshipOfferResponseDto> updateOfferStatus(
        @PathVariable Long id,
        @RequestParam String status,
        @RequestParam String reason
    ) {
        ApprovalStatus newStatus = ApprovalStatus.valueOf(status.toUpperCase());
        InternshipOfferResponseDto responseOffer =
            internshipOfferService.updateOfferStatus(id, newStatus, reason);
        return ResponseEntity.ok(responseOffer);
    }

    @GetMapping("/{id}/create-pdf")
    public ResponseEntity<ByteArrayResource> downloadInternshipOfferPdf(
        @PathVariable Long id
    ) throws IOException {
        byte[] pdfBytes = internshipOfferService.generateInternshipOfferPdf(id);
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add(
            HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=internship_offer.pdf"
        );

        return ResponseEntity.ok()
            .headers(headers)
            .contentLength(pdfBytes.length)
            .contentType(MediaType.APPLICATION_PDF)
            .body(resource);
    }
}
