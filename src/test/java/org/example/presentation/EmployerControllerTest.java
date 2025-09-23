package org.example.presentation;

import org.example.model.Employer;
import org.example.service.EmployerService;
import org.example.service.InternshipOfferService;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployerControllerTest {

    @Mock
    private EmployerService employerService;
    @Mock
    private InternshipOfferService internshipOfferService;


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

        EmployerResponseDto employerResponseDto = EmployerResponseDto.builder()
                .firstName("John")
                .lastName("Doe")
                .email("test@google.com")
                .since(dto.getSince())
                .enterpriseName("Google")
                .build();

        when(employerService.saveEmployer(dto)).thenReturn(employerResponseDto);

        // Act
        ResponseEntity<EmployerResponseDto> response = employerController.registerEmployer(dto);

        // Assert
        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isEqualTo(employerResponseDto);
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

        when(employerService.saveEmployer(dto)).thenThrow(new DuplicateUserException(""));

        // Act + Assert
        assertThatThrownBy(() -> employerController.registerEmployer(dto))
                .isInstanceOf(DuplicateUserException.class);
    }
}