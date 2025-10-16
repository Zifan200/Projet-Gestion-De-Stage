package org.example.presentation;


import lombok.RequiredArgsConstructor;
import org.example.service.InternshipApplicationService;
import org.example.service.dto.InternshipApplication.InternshipApplicationResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/internship-applications")
@CrossOrigin(origins = "http://localhost:5173")
public class InternshipApplicationController {

    private final InternshipApplicationService  internshipApplicationService;

//    @PreAuthorize("hasAnyAuthority('ROLE_ROLE_GESTIONNAIRE','ROLE_ROLE_STUDENT')")
    @GetMapping("/get-all")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplications(){
        return ResponseEntity.ok(internshipApplicationService.getAllApplications());
    }

    @GetMapping("get-all/{status}")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplications(@PathVariable String status){
        return ResponseEntity.ok(internshipApplicationService.getAllApplicationsWithStatus(status));
    }

    @GetMapping("internship-offer/{id}/get-all-applications")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplicationsFromOffer(
            @PathVariable Long id
    ){
        return ResponseEntity.ok(internshipApplicationService.getAllApplicationsFromOffer(id));
    }

    @GetMapping("internship-offer/{id}/get-all-applications/{status}")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplicationsFromOffer(
            @PathVariable Long id,
            @PathVariable String status
    ){
        return ResponseEntity.ok(internshipApplicationService.getAllApplicationsFromOfferWithStatus(id, status));
    }
}
