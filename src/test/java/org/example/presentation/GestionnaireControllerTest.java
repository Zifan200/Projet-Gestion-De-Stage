package org.example.presentation;

import org.example.presentation.exception.EmployerControllerException;
import org.example.presentation.exception.InternshipApplicationControllerException;
import org.example.service.CVService;
import org.example.service.InternshipApplicationService;
import org.example.service.StudentService;
import org.example.service.dto.student.EtudiantDTO;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GestionnaireControllerTest {

    @Mock
    private InternshipApplicationService internshipApplicationService;

    @InjectMocks
    private GestionnaireController gestionnaireController;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(gestionnaireController)
                // optional: you could create GestionnaireControllerException() if you have one
                .setControllerAdvice(new EmployerControllerException())
                .build();
    }

    private static final String BASE_PATH = "/api/v1/gs";
    @Test
    void getAllStudentsWithApplication_shouldReturn200() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(gestionnaireController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        EtudiantDTO student = EtudiantDTO.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@mail.com")
                .build();

        when(internshipApplicationService.getAllStudentsAppliedToAInternshipOffer())
                .thenReturn(List.of(student));

        // Act + Assert
        mockMvc.perform(get(BASE_PATH + "/get-all/students/with-application")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("John"))
                .andExpect(jsonPath("$[0].lastName").value("Doe"))
                .andExpect(jsonPath("$[0].email").value("john.doe@mail.com"));
    }

    @Test
    void getAllStudentsWithApplication_shouldReturn400_whenNoStudentsFound() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(gestionnaireController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        when(internshipApplicationService.getAllStudentsAppliedToAInternshipOffer())
                .thenThrow(new InvalidInternshipApplicationException("No students found"));

        // Act
        var result = mockMvc.perform(get(BASE_PATH + "/get-all/students/with-application")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        // Assert
        Exception resolved = result.getResolvedException();
        assert resolved != null;
        org.junit.jupiter.api.Assertions.assertInstanceOf(InvalidInternshipApplicationException.class, resolved);
    }
}

