package org.example.service;

import jakarta.validation.constraints.Email;
import org.example.event.UserCreatedEvent;
import org.example.model.EmailMessage;
import org.example.model.Employer;
import org.example.model.UserApp;
import org.example.repository.EmployerRepository;
import org.example.repository.UserAppRepository;
import org.example.security.exception.UsedEmailAddressException;
import org.example.service.dto.EmployerDto;
import org.example.service.exception.DuplicateUserException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployerServiceTest {

    @Mock
    private EmployerRepository employerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EmployerService employerService;

    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private EmailService emailService;


    @Test
    void createEmployer_shouldSaveEmployer() {
        // Arrange
        EmployerDto employerDto = EmployerDto.builder()
                .email("test@google.com")
                .firstName("Test Firstname")
                .lastName("Test LastName")
                .password("password")
                .since(LocalDate.now())
                .build();

        when(employerRepository.findByCredentialsEmail(employerDto.getEmail()))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode(employerDto.getPassword()))
                .thenReturn("encodedPassword123");
        when(employerRepository.save(any(Employer.class)))
                .thenAnswer(invocation -> (Employer) invocation.getArgument(0));


        // Act
        Employer savedEmployer = employerService.saveEmployer(employerDto);

        // Assert
        assertThat(savedEmployer)
                .extracting(Employer::getEmail, Employer::getFirstName, Employer::getLastName)
                .containsExactly("test@google.com", "Test Firstname", "Test LastName");
        verify(employerRepository).findByCredentialsEmail("test@google.com");
        verify(employerRepository).save(any(Employer.class));
        verify(eventPublisher).publishEvent(any(UserCreatedEvent.class));
    }

    @Test
    void updateEmployer_shouldNotSaveEmployer() {
        // Arrange
        EmployerDto employerDto = EmployerDto.builder()
                .email("test@google.com")
                .firstName("Test Firstname")
                .lastName("Test LastName")
                .password("password")
                .since(LocalDate.now())
                .build();

        when(employerRepository.findByCredentialsEmail(employerDto.getEmail()))
                .thenReturn(Optional.of(new Employer()));


        // Act + Assert
        assertThatThrownBy(() -> employerService.saveEmployer(employerDto))
                .isInstanceOf(DuplicateUserException.class);
        verify(employerRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
        verify(emailService, never()).sendEmail(any());
    }
}