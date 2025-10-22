package org.example.presentation;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.model.enums.ApprovalStatus;
import org.example.presentation.exception.InvalidStudentControllerException;
import org.example.service.InternshipApplicationService;
import org.example.service.StudentService;
import org.example.service.UserAppService;
import org.example.service.dto.student.EtudiantDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationDTO;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
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
}
