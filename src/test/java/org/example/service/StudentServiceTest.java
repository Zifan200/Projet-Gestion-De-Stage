package org.example.service;

import org.example.model.Etudiant;
import org.example.repository.EtudiantRepository;
import org.example.service.dto.student.EtudiantDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private StudentService studentService;

    @Test
    void getAllStudentsThatHasAppliedToInternship_shouldReturnStudentsWithApplications() {
        // Arrange
        Etudiant student = Etudiant.builder()
                .id(1L)
                .firstName("Jimmy")
                .lastName("Junior")
                .email("jimmyJunior@gmail.com")
                .phone("514-123-4567")
                .adresse("123 Rue Test")
                .program("Informatique")
                .since(LocalDate.now())
                .build();

        when(etudiantRepository.findByApplicationsIsNotEmpty())
                .thenReturn(List.of(student));

        // Act
        List<EtudiantDTO> students = studentService.getAllStudentsAppliedToAInternshipOffer();

        // Assert
        assertThat(students)
                .isNotEmpty()
                .hasSize(1);

        EtudiantDTO dto = students.get(0);
        assertThat(dto.getEmail()).isEqualTo("jimmyJunior@gmail.com");
        assertThat(dto.getProgram()).isEqualTo("Informatique");
        assertThat(dto.getFirstName()).isEqualTo("Jimmy");
    }
}
