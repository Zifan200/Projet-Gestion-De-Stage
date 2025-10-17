package org.example.presentation;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.service.EmployerService;
import org.example.service.InternshipApplicationService;
import org.example.service.InternshipOfferService;
import org.example.service.UserAppService;
import org.example.service.dto.EmployerDto;
import org.example.service.dto.EmployerResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.utils.JwtTokenUtils;
import org.springframework.http.HttpStatus;
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
