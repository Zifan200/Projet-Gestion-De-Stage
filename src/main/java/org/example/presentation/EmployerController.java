package org.example.presentation;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.model.Employer;
import org.example.security.exception.UsedEmailAddressException;
import org.example.service.EmployerService;
import org.example.service.dto.EmployerDto;
import org.example.service.dto.EmployerResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/employer")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployerController {
    private final EmployerService employerService;



    @PostMapping("/register")
    public ResponseEntity<EmployerResponseDto> registerEmployer(@Valid @RequestBody EmployerDto employerDto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(employerService.saveEmployer(employerDto));
    }
}
