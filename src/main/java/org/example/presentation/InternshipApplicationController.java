package org.example.presentation;


import lombok.RequiredArgsConstructor;
import org.example.service.InternshipApplicationService;
import org.example.service.dto.InternshipApplication.InternshipApplicationResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/internship-applications")
@CrossOrigin(origins = "http://localhost:5173")
public class InternshipApplicationController {

    private final InternshipApplicationService  internshipApplicationService;

    @GetMapping("/get-all")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplications(){
        return ResponseEntity.ok(internshipApplicationService.getAllApplications());
    }

    @GetMapping("get-all/{status}")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplications(@PathVariable String status){
        return ResponseEntity.ok(internshipApplicationService.getAllApplicationWithStatus(status));
    }
}
