package org.example.presentation;


import lombok.RequiredArgsConstructor;
import org.example.service.InternshipApplicationService;
import org.example.service.UserAppService;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/internship-applications")
@CrossOrigin(origins = "http://localhost:5173")
public class InternshipApplicationController {
    private final UserAppService userAppService;
    private final InternshipApplicationService  internshipApplicationService;

    @GetMapping("/get-all")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplications(){
        return ResponseEntity.ok(internshipApplicationService.getAllApplications());
    }

    @GetMapping("/get-all/{status}")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplications(@PathVariable String status){
        return ResponseEntity.ok(internshipApplicationService.getAllApplicationsWithStatus(status));
    }

    @GetMapping("/get-all/internship-offer/{id}")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplicationsFromOffer(
            @PathVariable Long id
    ){
        return ResponseEntity.ok(internshipApplicationService.getAllApplicationsFromOffer(id));
    }

    @GetMapping("/get-all/{status}/internship-offer/{id}")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplicationsFromOffer(
            @PathVariable Long id,
            @PathVariable String status
    ){
        return ResponseEntity.ok(internshipApplicationService.getAllApplicationsFromOfferWithStatus(id, status));
    }
}
