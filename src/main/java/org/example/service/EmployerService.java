package org.example.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.event.UserCreatedEvent;
import org.example.event.UserEventListener;
import org.example.model.Employer;
import org.example.model.InternshipApplication;
import org.example.model.UserApp;
import org.example.repository.EmployerRepository;
import org.example.repository.InternshipApplicationRepository;
import org.example.repository.UserAppRepository;
import org.example.security.JwtTokenProvider;
import org.example.security.exception.UsedEmailAddressException;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.*;
import org.example.service.dto.InternshipApplication.InternshipApplicationResponseDTO;
import org.example.service.exception.DuplicateUserException;
import org.example.utils.EmailTemplate;
import org.example.utils.JwtTokenUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmployerService {
    private static final Logger logger = LoggerFactory.getLogger(EmployerService.class);
    private final EmployerRepository employerRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserAppService userAppService;
    private final EmailService emailService;
    private final InternshipApplicationService  internshipApplicationService;
    private final ApplicationEventPublisher eventPublisher;

    public EmployerResponseDto saveEmployer(EmployerDto employerDto) {
        employerRepository.findByCredentialsEmail(employerDto.getEmail())
                .ifPresent(e -> { throw new DuplicateUserException("Employer already exists"); });

        Employer employer = Employer.builder()
                .firstName(employerDto.getFirstName())
                .lastName(employerDto.getLastName())
                .email(employerDto.getEmail())
                .password(passwordEncoder.encode(employerDto.getPassword()))
                .since(LocalDate.now())
                .enterpriseName(employerDto.getEnterpriseName())
                .phone(employerDto.getPhone())
                .build();

        var savedEmployer = employerRepository.save(employer);
        eventPublisher.publishEvent(new UserCreatedEvent(savedEmployer));
        logger.info("Employer created = {}", employer.getEmail());
        return EmployerResponseDto.create(savedEmployer);
    }

}