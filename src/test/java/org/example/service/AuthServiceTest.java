package org.example.service;

import org.example.event.PasswordResetRequestEvent;
import org.example.model.Employer;
import org.example.model.UserApp;
import org.example.model.auth.Credentials;
import org.example.model.auth.Role;
import org.example.repository.UserAppRepository;
import org.example.security.JwtTokenProvider;
import org.example.service.dto.util.LoginDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserAppRepository userAppRepository;

    @Mock
    private UserAppService userAppService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private UserApp testUser;

    @BeforeEach
    void setUp() {
        Credentials creds = Credentials.builder()
                .email("test@example.com")
                .password("test123!")
                .role(Role.EMPLOYER)
                .build();

        testUser = new Employer();
        testUser.setCredentials(creds);
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
    }

    @Test
    void testUserLoginSuccess() {
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("plainPassword");

        when(userAppRepository.findUserAppByEmail("test@example.com"))
                .thenReturn(Optional.ofNullable(testUser));
        when(passwordEncoder.matches("plainPassword", "test123!"))
                .thenReturn(true);
        when(userAppService.authenticateUser(loginDTO)).thenReturn("jwtToken");

        String token = authService.userLogin(loginDTO);

        assertEquals("jwtToken", token);
    }

    @Test
    void testUserLoginFailure() {
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("test456?");

        when(userAppRepository.findUserAppByEmail("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("test456?", "test123!"))
                .thenReturn(false);

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authService.userLogin(loginDTO));

        assertTrue(exception.getMessage().contains("Votre courriel ou mot de passe est erroné."));
    }

    @Test
    void testUserPasswordResetRequest() {
        when(userAppRepository.findUserAppByEmail("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generatePasswordResetToken("test@example.com"))
                .thenReturn("resetToken123");

        authService.userPasswordResetRequest("test@example.com");

        ArgumentCaptor<PasswordResetRequestEvent> eventCaptor = ArgumentCaptor.forClass(PasswordResetRequestEvent.class);
        verify(eventPublisher, times(1)).publishEvent(eventCaptor.capture());

        PasswordResetRequestEvent event = eventCaptor.getValue();
        assertEquals("test@example.com", event.getUser().getEmail());
        assertEquals("resetToken123", event.getResetToken());
    }
}