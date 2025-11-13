package org.example.presentation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.LocalDate;
import java.util.List;
import org.example.service.TeacherService;
import org.example.service.UserAppService;
import org.example.service.dto.student.EtudiantDTO;
import org.example.service.dto.teacher.TeacherDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class TeacherControllerTest {

    @Mock
    private TeacherService teacherService;

    @Mock
    private UserAppService userAppService;

    @InjectMocks
    private TeacherController teacherController;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(
        new JavaTimeModule()
    );

    private static final String FAKE_JWT = "fake-jwt";
    private static final String TEACHER_EMAIL = "teacher@college.com";

    @Test
    void createTeacher_shouldReturn201() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            teacherController
        ).build();

        TeacherDTO requestDTO = TeacherDTO.builder()
            .email("marie@college.com")
            .firstName("Marie")
            .lastName("Tremblay")
            .password("Password123!")
            .phone("514-555-1234")
            .department("Informatique")
            .specialization("Développement logiciel")
            .since(LocalDate.of(2020, 9, 1))
            .build();

        TeacherDTO responseDTO = TeacherDTO.builder()
            .id(1L)
            .email("marie@college.com")
            .firstName("Marie")
            .lastName("Tremblay")
            .phone("514-555-1234")
            .department("Informatique")
            .specialization("Développement logiciel")
            .since(LocalDate.of(2020, 9, 1))
            .numberOfStudents(0)
            .build();

        when(teacherService.saveTeacher(any(TeacherDTO.class))).thenReturn(
            responseDTO
        );

        // Act + Assert
        mockMvc
            .perform(
                post("/api/v1/teacher/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDTO))
            )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("marie@college.com"))
            .andExpect(jsonPath("$.firstName").value("Marie"))
            .andExpect(jsonPath("$.lastName").value("Tremblay"))
            .andExpect(jsonPath("$.department").value("Informatique"))
            .andExpect(
                jsonPath("$.specialization").value("Développement logiciel")
            );

        verify(teacherService).saveTeacher(any(TeacherDTO.class));
    }

    @Test
    void getAllTeachers_shouldReturn200() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            teacherController
        ).build();

        TeacherDTO teacher1 = TeacherDTO.builder()
            .id(1L)
            .email("marie@college.com")
            .firstName("Marie")
            .lastName("Tremblay")
            .phone("514-555-1234")
            .department("Informatique")
            .numberOfStudents(3)
            .build();

        TeacherDTO teacher2 = TeacherDTO.builder()
            .id(2L)
            .email("jean@college.com")
            .firstName("Jean")
            .lastName("Dupont")
            .phone("514-555-5678")
            .department("Mathématiques")
            .numberOfStudents(5)
            .build();

        when(teacherService.getAllTeachers()).thenReturn(
            List.of(teacher1, teacher2)
        );

        // Act + Assert
        mockMvc
            .perform(
                get("/api/v1/teacher").contentType(MediaType.APPLICATION_JSON)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].email").value("marie@college.com"))
            .andExpect(jsonPath("$[0].firstName").value("Marie"))
            .andExpect(jsonPath("$[0].department").value("Informatique"))
            .andExpect(jsonPath("$[0].numberOfStudents").value(3))
            .andExpect(jsonPath("$[1].id").value(2))
            .andExpect(jsonPath("$[1].email").value("jean@college.com"))
            .andExpect(jsonPath("$[1].numberOfStudents").value(5));

        verify(teacherService).getAllTeachers();
    }

    @Test
    void getAllTeachers_shouldReturn200_whenEmpty() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            teacherController
        ).build();

        when(teacherService.getAllTeachers()).thenReturn(List.of());

        // Act + Assert
        mockMvc
            .perform(
                get("/api/v1/teacher").contentType(MediaType.APPLICATION_JSON)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        verify(teacherService).getAllTeachers();
    }

    @Test
    void getTeacherById_shouldReturn200() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            teacherController
        ).build();

        TeacherDTO teacherDTO = TeacherDTO.builder()
            .id(1L)
            .email("marie@college.com")
            .firstName("Marie")
            .lastName("Tremblay")
            .phone("514-555-1234")
            .department("Informatique")
            .specialization("Développement logiciel")
            .numberOfStudents(3)
            .build();

        when(teacherService.getTeacherById(1L)).thenReturn(teacherDTO);

        // Act + Assert
        mockMvc
            .perform(
                get("/api/v1/teacher/1").contentType(MediaType.APPLICATION_JSON)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("marie@college.com"))
            .andExpect(jsonPath("$.firstName").value("Marie"))
            .andExpect(jsonPath("$.lastName").value("Tremblay"))
            .andExpect(jsonPath("$.department").value("Informatique"))
            .andExpect(
                jsonPath("$.specialization").value("Développement logiciel")
            )
            .andExpect(jsonPath("$.numberOfStudents").value(3));

        verify(teacherService).getTeacherById(1L);
    }

    @Test
    void getTeacherByEmail_shouldReturn200() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            teacherController
        ).build();

        TeacherDTO teacherDTO = TeacherDTO.builder()
            .id(1L)
            .email("marie@college.com")
            .firstName("Marie")
            .lastName("Tremblay")
            .phone("514-555-1234")
            .department("Informatique")
            .numberOfStudents(3)
            .build();

        when(teacherService.getTeacherByEmail("marie@college.com")).thenReturn(
            teacherDTO
        );

        // Act + Assert
        mockMvc
            .perform(
                get("/api/v1/teacher/email/marie@college.com").contentType(
                    MediaType.APPLICATION_JSON
                )
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("marie@college.com"))
            .andExpect(jsonPath("$.firstName").value("Marie"))
            .andExpect(jsonPath("$.lastName").value("Tremblay"));

        verify(teacherService).getTeacherByEmail("marie@college.com");
    }

    @Test
    void getTeachersByDepartment_shouldReturn200() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            teacherController
        ).build();

        TeacherDTO teacher1 = TeacherDTO.builder()
            .id(1L)
            .email("marie@college.com")
            .firstName("Marie")
            .lastName("Tremblay")
            .department("Informatique")
            .numberOfStudents(3)
            .build();

        TeacherDTO teacher2 = TeacherDTO.builder()
            .id(2L)
            .email("pierre@college.com")
            .firstName("Pierre")
            .lastName("Martin")
            .department("Informatique")
            .numberOfStudents(2)
            .build();

        when(teacherService.getTeachersByDepartment("Informatique")).thenReturn(
            List.of(teacher1, teacher2)
        );

        // Act + Assert
        mockMvc
            .perform(
                get("/api/v1/teacher/department/Informatique").contentType(
                    MediaType.APPLICATION_JSON
                )
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].email").value("marie@college.com"))
            .andExpect(jsonPath("$[0].department").value("Informatique"))
            .andExpect(jsonPath("$[1].id").value(2))
            .andExpect(jsonPath("$[1].email").value("pierre@college.com"))
            .andExpect(jsonPath("$[1].department").value("Informatique"));

        verify(teacherService).getTeachersByDepartment("Informatique");
    }

    @Test
    void getTeachersByDepartment_shouldReturn200_whenEmpty() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            teacherController
        ).build();

        when(teacherService.getTeachersByDepartment("Physics")).thenReturn(
            List.of()
        );

        // Act + Assert
        mockMvc
            .perform(
                get("/api/v1/teacher/department/Physics").contentType(
                    MediaType.APPLICATION_JSON
                )
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        verify(teacherService).getTeachersByDepartment("Physics");
    }

    @Test
    void getMyStudents_shouldReturn200() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            teacherController
        ).build();

        TeacherDTO teacherDTO = TeacherDTO.builder()
            .email(TEACHER_EMAIL)
            .build();

        EtudiantDTO student1 = EtudiantDTO.builder()
            .id(1L)
            .email("pierre@student.com")
            .firstName("Pierre")
            .lastName("Martin")
            .phone("514-555-1111")
            .program("Informatique")
            .build();

        EtudiantDTO student2 = EtudiantDTO.builder()
            .id(2L)
            .email("sophie@student.com")
            .firstName("Sophie")
            .lastName("Dubois")
            .phone("514-555-2222")
            .program("Informatique")
            .build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(teacherDTO);
        when(teacherService.getMyStudents(TEACHER_EMAIL)).thenReturn(
            List.of(student1, student2)
        );

        // Act + Assert
        mockMvc
            .perform(
                get("/api/v1/teacher/my-students")
                    .header("Authorization", "Bearer " + FAKE_JWT)
                    .contentType(MediaType.APPLICATION_JSON)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].email").value("pierre@student.com"))
            .andExpect(jsonPath("$[0].firstName").value("Pierre"))
            .andExpect(jsonPath("$[0].lastName").value("Martin"))
            .andExpect(jsonPath("$[0].program").value("Informatique"))
            .andExpect(jsonPath("$[1].id").value(2))
            .andExpect(jsonPath("$[1].email").value("sophie@student.com"))
            .andExpect(jsonPath("$[1].firstName").value("Sophie"));

        verify(userAppService).getMe(FAKE_JWT);
        verify(teacherService).getMyStudents(TEACHER_EMAIL);
    }

    @Test
    void getMyStudents_shouldReturn200_whenNoStudents() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
            teacherController
        ).build();

        TeacherDTO teacherDTO = TeacherDTO.builder()
            .email(TEACHER_EMAIL)
            .build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(teacherDTO);
        when(teacherService.getMyStudents(TEACHER_EMAIL)).thenReturn(List.of());

        // Act + Assert
        mockMvc
            .perform(
                get("/api/v1/teacher/my-students")
                    .header("Authorization", "Bearer " + FAKE_JWT)
                    .contentType(MediaType.APPLICATION_JSON)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        verify(userAppService).getMe(FAKE_JWT);
        verify(teacherService).getMyStudents(TEACHER_EMAIL);
    }
}
