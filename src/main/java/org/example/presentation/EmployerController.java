package org.example.presentation;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.model.Employer;
import org.example.security.exception.UsedEmailAddressException;
import org.example.service.EmployerService;
import org.example.service.InternshipOfferService;
import org.example.service.UserAppService;
import org.example.service.dto.EmployerDto;
import org.example.service.dto.EmployerResponseDto;
import org.example.service.dto.InternshipOfferDto;
import org.example.service.dto.InternshipOfferResponseDto;
import org.example.utils.JwtTokenUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/employer")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployerController {
    private final UserAppService userAppService;
    private final EmployerService employerService;
    private final InternshipOfferService internshipOfferService;

    @PostMapping("/register")
    public ResponseEntity<EmployerResponseDto> registerEmployer(@Valid @RequestBody EmployerDto employerDto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(employerService.saveEmployer(employerDto));
    }

    @PostMapping("/create-internship-offer")
    public ResponseEntity<InternshipOfferResponseDto> createInternShipOffer(HttpServletRequest request, @Valid @RequestBody InternshipOfferDto internshipOfferDto) {
        try {

            String email = userAppService.getMe(JwtTokenUtils.getTokenFromRequest(request)).getEmail();
            return ResponseEntity
                    .ok(internshipOfferService.saveInternshipOffer(email, internshipOfferDto));

        }catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
