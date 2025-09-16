package org.example.presentation;

import org.example.model.Employer;
import org.example.security.exception.UsedEmailAddressException;
import org.example.service.EmployerService;
import org.example.service.dto.EmployerDto;
import org.example.service.dto.EmployerResponseDto;
import org.example.service.exception.DuplicateUserException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployerControllerTest {

    @Mock
    private EmployerService employerService;

    @InjectMocks
    private EmployerController employerController;

    @Test
    void registerEmployer_shouldReturn201() {
        // Arrange
        EmployerDto dto = EmployerDto.builder()
                .email("test@google.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .since(LocalDate.now())
                .build();

        Employer employer = Employer.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("test@google.com")
                .password("encodedPassword")
                .since(dto.getSince())
                .build();

        when(employerService.saveEmployer(dto)).thenReturn(employer);

        // Act
        ResponseEntity response = employerController.registerEmployer(dto);

        // Assert

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isEqualTo(EmployerResponseDto.create(employer));
    }

    @Test
    void registerEmployer_shouldReturn409() {
        // Arrange
        EmployerDto dto = EmployerDto.builder()
                .email("test@google.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .since(LocalDate.now())
                .build();

        Employer employer = Employer.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("test@google.com")
                .password("encodedPassword")
                .since(dto.getSince())
                .build();

        when(employerService.saveEmployer(dto)).thenThrow(new DuplicateUserException(""));


        // Act + Assert
        assertThatThrownBy(() -> employerController.registerEmployer(dto))
                .isInstanceOf(DuplicateUserException.class);
    }
}