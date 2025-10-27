package org.example.presentation;

import org.example.presentation.exception.EmployerControllerException;
import org.example.service.CVService;
import org.example.service.StudentService;
import org.example.service.dto.student.EtudiantDTO;
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
    private CVService cvService;

    @Mock
    private StudentService studentService;

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

    private static final String PATH = "/api/v1/gs/";

}
