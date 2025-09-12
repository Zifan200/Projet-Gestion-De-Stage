package org.example.service;


import lombok.RequiredArgsConstructor;
import org.example.model.Employer;
import org.example.model.UserApp;
import org.example.repository.EmployerRepository;
import org.example.repository.UserAppRepository;
import org.example.security.JwtTokenProvider;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserAppService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserAppRepository userAppRepository;
    private final EmployerRepository employerRepository;
    private PasswordEncoder passwordEncoder;


    public String authenticateUser(LoginDTO loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));
        final String token = jwtTokenProvider.generateToken(authentication);
        return token;
    }

    public UserDTO getMe(String token) {
        token = token.startsWith("Bearer") ? token.substring(7) : token;
        String email = jwtTokenProvider.getEmailFromJWT(token);
        UserApp user = userAppRepository.findUserAppByEmail(email).orElseThrow(UserNotFoundException::new);
        return switch(user.getRole()){
            case EMPLOYER -> getEmployerDTO(user.getId());
        };
    }

    private EmployerDto getEmployerDTO(Long id) {
        final Optional<Employer>  employerOptional = employerRepository.findById(id);
        return employerOptional.isPresent() ?
                EmployerDto.create(employerOptional.get()) :
                EmployerDto.empty();
    }

    public void saveEmployer(EmployerDto employerDto) {
        Optional<UserApp> user = userAppRepository.findUserAppByEmail(employerDto.getEmail());

        if (user.isEmpty()) {
            Employer employer = Employer.builder()
                    .firstName(employerDto.getFirstName())
                    .lastName(employerDto.getLastName())
                    .email(employerDto.getEmail())
                    .password(passwordEncoder.encode(employerDto.getPassword()))
                    .since(employerDto.getSince())
                    .build();
            userAppRepository.save(employer);
        }
    }
}

