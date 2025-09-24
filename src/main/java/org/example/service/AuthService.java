package org.example.service;


import lombok.RequiredArgsConstructor;
import org.example.event.PasswordResetRequestEvent;
import org.example.model.UserApp;
import org.example.model.auth.Credentials;
import org.example.repository.UserAppRepository;
import org.example.security.JwtTokenProvider;
import org.example.security.exception.InvalidJwtTokenException;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.LoginDTO;
import org.example.service.dto.PasswordRequestDTO;
import org.example.service.dto.UserDTO;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAppRepository userAppRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserAppService userAppService;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApplicationEventPublisher eventPublisher;


    private final Map<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration LOCK_TIME = Duration.ofMinutes(15);


    private record LoginAttempt(int attempts, LocalDateTime lastAttempt) {}

    public String userLogin(LoginDTO loginDTO) {

        String email = loginDTO.getEmail();
        String password = loginDTO.getPassword();

        if (email == null || email.isEmpty()) {
            throw new AuthenticationCredentialsNotFoundException("Veuillez entrer un courriel.");
        }

        if (password == null || password.isEmpty()) {
            throw new AuthenticationCredentialsNotFoundException("Veuillez entrer un mot de passe.");
        }

        if (isAccountLocked(email)) {
            throw new LockedException(
                    "Compte verrouillé après " + MAX_ATTEMPTS + " tentatives. Réessayez dans 15 minutes."
            );
        }

        UserApp user = userAppRepository.findUserAppByEmail(email)
                .orElseThrow();

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            registerFailedAttempt(email);
            throw new BadCredentialsException("Votre courriel ou mot de passe est erroné.");
        }

        loginAttempts.remove(email);

        return userAppService.authenticateUser(loginDTO);
    }

    private boolean isAccountLocked(String email) {
        LoginAttempt attempt = loginAttempts.get(email);
        if (attempt == null) return false;

        if (attempt.attempts() < MAX_ATTEMPTS) return false;

        if (Duration.between(attempt.lastAttempt(), LocalDateTime.now()).compareTo(LOCK_TIME) > 0) {
            loginAttempts.remove(email);
            return false;
        }
        return true;
    }

    private void registerFailedAttempt(String email) {
        loginAttempts.compute(email, (key, attempt) -> {
            if (attempt == null) {
                return new LoginAttempt(1, LocalDateTime.now());
            }
            return new LoginAttempt(attempt.attempts() + 1, LocalDateTime.now());
        });
    }

    @Transactional
    public void userPasswordReset(PasswordRequestDTO passwordRequestDTO) {
        try {
            String email = jwtTokenProvider.getEmailFromJWT(passwordRequestDTO.getToken());
            UserApp user = userAppRepository.findUserAppByEmail(email)
                    .orElseThrow();

            Credentials newCredentials = Credentials.builder()
                    .email(user.getEmail())
                    .password(passwordEncoder.encode(passwordRequestDTO.getNewPassword()))
                    .role(user.getRole())
                    .build();

            user.setCredentials(newCredentials);
            userAppRepository.save(user);
        }
        catch (Exception e) {
            throw new InvalidJwtTokenException(HttpStatus.UNAUTHORIZED, "Token invalide ou expiré.");
        }
    }

    public void userPasswordResetRequest(String email) {
        UserApp user = userAppRepository.findUserAppByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Étudiant introuvable avec email " + email));

        UserDTO userDTO = new UserDTO(user);

        String resetToken = jwtTokenProvider.generatePasswordResetToken(user.getEmail());

        eventPublisher.publishEvent(new PasswordResetRequestEvent(userDTO, resetToken));
    }
}
