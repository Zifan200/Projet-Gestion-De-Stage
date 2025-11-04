package org.example.presentation;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.model.InternshipOffer;
import org.example.model.enums.ApprovalStatus;
import org.example.presentation.exception.EmployerControllerException;
import org.example.presentation.exception.InternshipApplicationControllerException;
import org.example.presentation.exception.InvalidStudentControllerException;
import org.example.service.InternshipApplicationService;
import org.example.service.StudentService;
import org.example.service.UserAppService;
import org.example.service.dto.student.EtudiantDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.dto.student.EtudiantDecisionDTO;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.aspectj.weaver.tools.cache.SimpleCacheFactory.path;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class StudentControllerTest {

    @Mock
    private UserAppService userAppService;

    @Mock
    private InternshipApplicationService internshipApplicationService;

    @Mock
    private StudentService studentService;

    @InjectMocks
    private EtudiantController etudiantController;

    private static final String FAKE_JWT = "fake-jwt";
    private static final String EMAIL = "student@mail.com";

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void applyToInternshipOffer_shouldReturn201() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InvalidStudentControllerException())
                .build();

        // Arrange
        EtudiantDTO studentDto = EtudiantDTO.builder()
                .email(EMAIL)
                .firstName("firstName")
                .lastName("lastName")
                .password("password")
                .phone("123-456-7890")
                .program("Program")
                .build();

        InternshipApplicationDTO dto = new InternshipApplicationDTO();
        dto.setSelectedCvID(5L);
        dto.setInternshipOfferId(10L);
        dto.setStudentEmail(EMAIL);

        InternshipApplicationResponseDTO responseDto = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .status(ApprovalStatus.PENDING)
                .build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(studentDto);
        when(internshipApplicationService.saveInternshipApplication(any(InternshipApplicationDTO.class)))
                .thenReturn(responseDto);


        // Act + Assert
        mockMvc.perform(post("/api/v1/student/apply-to-internship-offer")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType("application/json")
                        .content("""
            {
                "studentEmail": "student@example.com",
                "selectedCvID": 1,
                "internshipOfferId": 2
            }
        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void applyToInternshipOffer_shouldReturn400_WhenInvalidApplication() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InvalidStudentControllerException())
                .build();

        // Arrange
        EtudiantDTO studentDto = EtudiantDTO.builder()
                .email(EMAIL)
                .firstName("firstName")
                .lastName("lastName")
                .password("password")
                .phone("123-456-7890")
                .program("Program")
                .build();

        InternshipApplicationDTO dto = new InternshipApplicationDTO();
        dto.setSelectedCvID(999L);
        dto.setInternshipOfferId(888L);
        dto.setStudentEmail(EMAIL);

        when(userAppService.getMe(FAKE_JWT)).thenReturn(studentDto);
        when(internshipApplicationService.saveInternshipApplication(any(InternshipApplicationDTO.class)))
                .thenThrow(new InvalidInternshipApplicationException("Invalid internship offer: CV not found"));

        // Act
        mockMvc.perform(post("/api/v1/student/apply-to-internship-offer")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType("application/json")
                        .content("""
            {
                "studentEmail": "student@example.com",
                "selectedCvID": 1,
                "internshipOfferId": 2
            }
        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getInternshipApplicationForStudentById_shouldReturn200() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InvalidStudentControllerException())
                .build();

        EtudiantDTO savedStudent = EtudiantDTO.builder().email(EMAIL).build();

        InternshipApplicationResponseDTO applicationRes = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail(EMAIL)
                .internshipOfferId(1L)
                .internshipOfferTitle("Développeur Fullstack")
                .build();

        // Act
        when(userAppService.getMe(FAKE_JWT)).thenReturn(savedStudent);
        when(internshipApplicationService.getApplicationByStudentAndId(EMAIL, applicationRes.getId()))
                .thenReturn(applicationRes);

        // Assert
        mockMvc.perform(get("/api/v1/student/get-internship-application/1")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("id").value(1))
                .andExpect(jsonPath("studentEmail").value(EMAIL))
                .andExpect(jsonPath("internshipOfferId").value(1))
                .andExpect(jsonPath("internshipOfferTitle").value("Développeur Fullstack"));
    }

    @Test
    void getInternshipApplicationForStudentById_shouldReturn400_whenNoApplications() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InvalidStudentControllerException())
                .build();

        EtudiantDTO savedStudent = EtudiantDTO.builder().email(EMAIL).build();

        // Act
        when(userAppService.getMe(FAKE_JWT)).thenReturn(savedStudent);
        when(internshipApplicationService.getApplicationByStudentAndId(EMAIL, 1L))
                .thenThrow(new InvalidInternshipApplicationException("Internship application not found"));

        // Assert
        MvcResult result = mockMvc.perform(get("/api/v1/student/get-internship-application/1")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternshipApplicationException);
    }

    @Test
    void getInternshipApplicationForStudentById_shouldReturn400_withWrongStudent() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InvalidStudentControllerException())
                .build();

        EtudiantDTO savedStudent = EtudiantDTO.builder().email(EMAIL).build();

        InternshipApplicationResponseDTO applicationRes = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("incorrect.student@gmail.com")
                .internshipOfferId(1L)
                .internshipOfferTitle("Développeur Fullstack")
                .build();

        // Act
        when(userAppService.getMe(FAKE_JWT)).thenReturn(savedStudent);
        when(internshipApplicationService.getApplicationByStudentAndId(EMAIL, 1L))
                .thenThrow(new InvalidInternshipApplicationException("Invalid user"));

        // Assert
        MvcResult result = mockMvc.perform(get("/api/v1/student/get-internship-application/1")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternshipApplicationException);
    }

    @Test
    void getAllInternshipApplicationsForStudent_shouldReturn200() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InvalidStudentControllerException())
                .build();

        EtudiantDTO savedStudent = EtudiantDTO.builder().email(EMAIL).build();

        InternshipApplicationResponseDTO applicationRes1 = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail(EMAIL)
                .internshipOfferId(1L)
                .internshipOfferTitle("Développeur Fullstack")
                .build();

        InternshipApplicationResponseDTO applicationRes2 = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail(EMAIL)
                .internshipOfferId(2L)
                .internshipOfferTitle("Programmeur Java")
                .build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(
                EtudiantDTO.builder().email(EMAIL).build()
        );

        // Act
        when(internshipApplicationService.getAllApplicationsFromStudent(EMAIL))
                .thenReturn(List.of(applicationRes1, applicationRes2));

        // Assert
        mockMvc.perform(get("/api/v1/student/get-all-internship-applications")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentEmail").value(EMAIL))
                .andExpect(jsonPath("$[0].internshipOfferTitle").value("Développeur Fullstack"))
                .andExpect(jsonPath("$[1].internshipOfferTitle").value("Programmeur Java"));
    }

    @Test
    void getAllInternshipApplicationsForStudent_shouldReturn200_whenNoApplications() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InvalidStudentControllerException())
                .build();

        EtudiantDTO savedStudent = EtudiantDTO.builder().email(EMAIL).build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(
                EtudiantDTO.builder().email(EMAIL).build()
        );

        // Act
        List<InternshipApplicationResponseDTO> list = internshipApplicationService.getAllApplicationsFromStudent(EMAIL);
        when(list).thenReturn(List.of());

        // Assert
        mockMvc.perform(get("/api/v1/student/get-all-internship-applications")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void getAllInternshipApplicationsForStudentByStatus_shouldReturn200() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InvalidStudentControllerException())
                .build();

        InternshipApplicationResponseDTO applicationRes1 = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail(EMAIL)
                .internshipOfferId(1L)
                .internshipOfferTitle("Développeur Fullstack")
                .status(ApprovalStatus.REJECTED)
                .build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(
                EtudiantDTO.builder().email(EMAIL).build()
        );

        // Act
        when(internshipApplicationService.getAllApplicationsFromStudentByStatus(EMAIL, "REJECTED"))
                .thenReturn(List.of(applicationRes1));

        // Assert
        mockMvc.perform(get("/api/v1/student/get-internship-applications/REJECTED")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentEmail").value(EMAIL))
                .andExpect(jsonPath("$[0].internshipOfferTitle").value("Développeur Fullstack"))
                .andExpect(jsonPath("$[0].status").value("REJECTED"));
    }

    @Test
    void getAllInternshipApplicationsForStudentByStatus_shouldReturn200_whenNoApplications() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InvalidStudentControllerException())
                .build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(
                EtudiantDTO.builder().email(EMAIL).build()
        );

        // Act
        List<InternshipApplicationResponseDTO> list =
                internshipApplicationService.getAllApplicationsFromStudentByStatus(EMAIL, "ACCEPTED");
        when(list).thenReturn(List.of());

        // Assert
        mockMvc.perform(get("/api/v1/student/get-internship-applications/ACCEPTED")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void getAllInternshipApplicationsForStudentByStatus_shouldReturn400_whenInvalidStatus() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InvalidStudentControllerException())
                .build();

        EtudiantDTO savedStudent = EtudiantDTO.builder().email(EMAIL).build();

        // Act
        when(userAppService.getMe(FAKE_JWT)).thenReturn(savedStudent);

        when(internshipApplicationService.getAllApplicationsFromStudentByStatus(EMAIL, "invalid"))
                .thenThrow(new InvalidInternshipApplicationException("Invalid status"));

        // Assert
        MvcResult result = mockMvc.perform(get("/api/v1/student/get-internship-applications/invalid")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternshipApplicationException);
    }
    @Test
    void acceptOfferByStudent_Success() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        InternshipApplicationResponseDTO responseDto = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Java Developer")
                .etudiantStatus(ApprovalStatus.CONFIRMED_BY_STUDENT)
                .build();

        EtudiantDecisionDTO request = new EtudiantDecisionDTO();
        request.setStudentEmail("student@mail.com");

        when(internshipApplicationService.acceptOfferByStudent("student@mail.com", 1L))
                .thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/student/1/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentEmail").value("student@mail.com"))
                .andExpect(jsonPath("$.etudiantStatus").value("CONFIRMED_BY_STUDENT"));

    }

    @Test
    void rejectOfferByStudent_Success() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(etudiantController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        InternshipApplicationResponseDTO responseDto = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Java Developer")
                .etudiantStatus(ApprovalStatus.REJECTED_BY_STUDENT)
                .etudiantRaison("Je préfère une autre offre.")
                .build();

        EtudiantDecisionDTO request = new EtudiantDecisionDTO();
        request.setStudentEmail("student@mail.com");
        request.setEtudiantRaison("Je préfère une autre offre.");

        when(internshipApplicationService.rejectOfferByStudent("student@mail.com", 1L, "Je préfère une autre offre."))
                .thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/student/1/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentEmail").value("student@mail.com"))
                .andExpect(jsonPath("$.etudiantStatus").value("REJECTED_BY_STUDENT"))
                .andExpect(jsonPath("$.etudiantRaison").value("Je préfère une autre offre."));
    }
}