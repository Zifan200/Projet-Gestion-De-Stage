package org.example.presentation;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.model.CV;
import org.example.service.*;
import org.example.service.dto.*;
import org.example.utils.JwtTokenUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.service.dto.InternshipApplication.*;

import java.util.List;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/employer")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployerController {
    private final UserAppService userAppService;
    private final EmployerService employerService;
    private final InternshipOfferService internshipOfferService;
    private final InternshipApplicationService internshipApplicationService;
    private final CVService cvService;

    @PostMapping("/register")
    public ResponseEntity<EmployerResponseDto> registerEmployer(@Valid @RequestBody EmployerDto employerDto) {
        System.out.println(employerDto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(employerService.saveEmployer(employerDto));
    }

    @PostMapping("/create-internship-offer")
    public ResponseEntity<InternshipOfferResponseDto> createInternShipOffer(
            HttpServletRequest request,
            @Valid @RequestBody InternshipOfferDto internshipOfferDto) {

        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(internshipOfferService.saveInternshipOffer(email, internshipOfferDto));

    }

    @GetMapping("/get-internship-application/{id}")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getInternshipApplicationForEmployerById(
            HttpServletRequest request,
            @PathVariable Long id
    ){
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        internshipApplicationService.getApplicationByEmployerAndId(email, id);
        return ResponseEntity.ok(internshipApplicationService.getAllApplications());
    }

    @GetMapping("/get-all-internship-applications")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplicationsForEmployer(
            HttpServletRequest request
    ){
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        internshipApplicationService.getAllApplicationsFromEmployer(email);
        return ResponseEntity.ok(internshipApplicationService.getAllApplications());
    }

    @GetMapping("/get-all-internship-applications/internship-offer/{id}")
    public ResponseEntity<List<InternshipApplicationResponseDTO>> getAllInternshipApplicationsForOfferForEmployer(
            HttpServletRequest request,
            @PathVariable Long id){
        String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
        internshipApplicationService.getAllApplicationsFromOfferFromEmployer(id, email);
        return ResponseEntity.ok(internshipApplicationService.getAllApplications());
    }
}