package org.example.presentation;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.model.enums.ApprovalStatus;
import org.example.presentation.exception.EmployerControllerException;
import org.example.presentation.exception.InternshipApplicationControllerException;
import org.example.presentation.exception.InternshipOfferControllerException;
import org.example.service.EmployerService;
import org.example.service.InternshipApplicationService;
import org.example.service.InternshipOfferService;
import org.example.service.UserAppService;
import org.example.service.dto.employer.EmployerDto;
import org.example.service.dto.employer.EmployerResponseDto;
import org.example.service.dto.internship.InternshipOfferDto;
import org.example.service.dto.internship.InternshipOfferResponseDto;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.exception.DuplicateUserException;
import org.example.service.exception.InvalidInternShipOffer;
import org.example.service.exception.InvalidInternshipApplicationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class EmployerControllerTest {

    @Mock
    private UserAppService userAppService;
    @Mock
    private EmployerService employerService;
    @Mock
    private InternshipOfferService internshipOfferService;

    @Mock
    private InternshipApplicationService internshipApplicationService;
    @InjectMocks
    private EmployerController employerController;

    private static final String AUTH_HEADER = "Authorization";
    private static final String FAKE_JWT = "fake-jwt";
    private static final String EMAIL = "student@mail.com";
    private static final String EMPLOYER_EMAIL = "employer@mail.com";

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


    @Test
    void createInternshipOffer_shouldReturn201() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(employerController)
            .setControllerAdvice(new InternshipOfferControllerException())
            .build();

        EmployerDto employerDto = EmployerDto.builder()
                .email("test@google.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .since(LocalDate.now())
                .build();

        InternshipOfferDto internshipOfferDto = InternshipOfferDto.builder()
                .title("Developer")
                .description("programme stuff")
                .employerEmail(employerDto.getEmail())
                .targetedProgramme("Computer Science")
                .salary(18.25f)
                .build();

        InternshipOfferResponseDto internshipResponseDto = InternshipOfferResponseDto.builder()
                .title(internshipOfferDto.getTitle())
                .description(internshipOfferDto.getDescription())
                .employerEmail(employerDto.getEmail())
                .targetedProgramme(internshipOfferDto.getTargetedProgramme())
                .salary(internshipOfferDto.getSalary())
                .build();

        // Arrange mocks
        when(userAppService.getMe(FAKE_JWT)).thenReturn(employerDto);
        when(internshipOfferService.saveInternshipOffer(employerDto.getEmail(), internshipOfferDto))
                .thenReturn(internshipResponseDto);

        // Serialize dto to JSON
        ObjectMapper mapper = new ObjectMapper();
        String requestBody = mapper.writeValueAsString(internshipOfferDto);

        // Act + Assert
        mockMvc.perform(post("/api/v1/employer/create-internship-offer")
                        .header("Authorization", "Bearer " + FAKE_JWT) // fake token
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Developer"))
                .andExpect(jsonPath("$.description").value("programme stuff"))
                .andExpect(jsonPath("$.targetedProgramme").value("Computer Science"))
                .andExpect(jsonPath("$.salary").value("18.25"));
    }

    @Test
    void createInternshipOffer_shouldReturn409() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(employerController)
            .setControllerAdvice(new InternshipOfferControllerException())
            .build();

        EmployerDto employerDto = EmployerDto.builder()
                .email("test@google.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .since(LocalDate.now())
                .build();

        InternshipOfferDto internshipOfferDto = InternshipOfferDto.builder()
                .title("Developer")
                .description("programme stuff")
                .employerEmail(employerDto.getEmail())
                .targetedProgramme("Computer Science")
                .salary(18.25f)
                .build();

        InternshipOfferResponseDto internshipResponseDto = InternshipOfferResponseDto.builder()
                .title(internshipOfferDto.getTitle())
                .description(internshipOfferDto.getDescription())
                .employerEmail(employerDto.getEmail())
                .targetedProgramme(internshipOfferDto.getTargetedProgramme())
                .salary(internshipOfferDto.getSalary())
                .build();

        // Arrange mocks
        when(userAppService.getMe(FAKE_JWT)).thenReturn(employerDto);
        when(internshipOfferService.saveInternshipOffer(employerDto.getEmail(), internshipOfferDto))
                .thenThrow(new InvalidInternShipOffer(""));


        // Serialize dto to JSON
        ObjectMapper mapper = new ObjectMapper();
        String requestBody = mapper.writeValueAsString(internshipOfferDto);

        // Act
        MvcResult result = mockMvc.perform(post("/api/v1/employer/create-internship-offer")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternShipOffer);
    }

    @Test
    void createInternshipOffer_shouldReturn409_whenInvalidSalary() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new InternshipOfferControllerException())
                .build();

        EmployerDto employerDto = EmployerDto.builder()
                .email("test@google.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .since(LocalDate.now())
                .build();

        InternshipOfferDto internshipOfferDto = InternshipOfferDto.builder()
                .title("Developer")
                .description("programme stuff")
                .employerEmail(employerDto.getEmail())
                .targetedProgramme("Computer Science")
                .salary(-10.23f)
                .build();

        InternshipOfferResponseDto internshipResponseDto = InternshipOfferResponseDto.builder()
                .title(internshipOfferDto.getTitle())
                .description(internshipOfferDto.getDescription())
                .employerEmail(employerDto.getEmail())
                .targetedProgramme(internshipOfferDto.getTargetedProgramme())
                .salary(internshipOfferDto.getSalary())
                .build();

        // Arrange mocks
        when(userAppService.getMe(FAKE_JWT)).thenReturn(employerDto);
        when(internshipOfferService.saveInternshipOffer(employerDto.getEmail(), internshipOfferDto))
                .thenThrow(new InvalidInternShipOffer("Le salaire est invalide"));


        // Serialize dto to JSON
        ObjectMapper mapper = new ObjectMapper();
        String requestBody = mapper.writeValueAsString(internshipOfferDto);

        // Act
        MvcResult result = mockMvc.perform(post("/api/v1/employer/create-internship-offer")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternShipOffer);
    }

    @Test
    void getAllInternshipApplicationsForEmployer_shouldReturn200() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new EmployerControllerException())
                .build();

        InternshipApplicationResponseDTO responseDto = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Java Developer")
                .salary(18.25f)
                .build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(
                EmployerDto.builder().email(EMPLOYER_EMAIL).build()
        );
        when(internshipApplicationService.getAllApplicationsFromEmployer(EMPLOYER_EMAIL))
                .thenReturn(List.of(responseDto));

        mockMvc.perform(get("/api/v1/employer/get-all-internship-applications")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentEmail").value("student@mail.com"))
                .andExpect(jsonPath("$[0].internshipOfferTitle").value("Java Developer"))
                .andExpect(jsonPath("$[0].salary").value("18.25"));
    }

    @Test
    void getAllInternshipApplicationsForOfferForEmployer_shouldReturn200() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new EmployerControllerException())
                .build();

        InternshipApplicationResponseDTO responseDto = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Backend Developer")
                .salary(18.25f)
                .build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(
                EmployerDto.builder().email(EMPLOYER_EMAIL).build()
        );
        when(internshipApplicationService.getAllApplicationsFromOfferFromEmployer(10L, EMPLOYER_EMAIL))
                .thenReturn(List.of(responseDto));

        mockMvc.perform(get("/api/v1/employer/get-all-internship-applications/internship-offer/10")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentEmail").value("student@mail.com"))
                .andExpect(jsonPath("$[0].internshipOfferTitle").value("Backend Developer"))
                .andExpect(jsonPath("$[0].salary").value("18.25"));
    }

    @Test
    void getAllInternshipApplicationsForEmployer_shouldReturn400_whenNoApplications() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(
                EmployerDto.builder().email(EMPLOYER_EMAIL).build()
        );
        when(internshipApplicationService.getAllApplicationsFromEmployer(EMPLOYER_EMAIL))
                .thenThrow(new InvalidInternshipApplicationException("No applications found"));

        MvcResult result = mockMvc.perform(get("/api/v1/employer/get-all-internship-applications")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternshipApplicationException);
    }

    @Test
    void getAllInternshipApplicationsForOfferForEmployer_shouldReturn400_whenOfferInvalid() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        when(userAppService.getMe(FAKE_JWT)).thenReturn(
                EmployerDto.builder().email(EMPLOYER_EMAIL).build()
        );
        when(internshipApplicationService.getAllApplicationsFromOfferFromEmployer(999L, EMPLOYER_EMAIL))
                .thenThrow(new InvalidInternshipApplicationException("Offer does not exist"));

        MvcResult result = mockMvc.perform(get("/api/v1/employer/get-all-internship-applications/internship-offer/999")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternshipApplicationException);
    }

    @Test
    void approveInternshipApplication_shouldReturn201() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new EmployerControllerException())
                .build();

        InternshipApplicationResponseDTO pendingApplication = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Backend Developer")
                .salary(18.25f)
                .build();

        InternshipApplicationResponseDTO approvedApplication = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Backend Developer")
                .salary(18.25f)
                .status(ApprovalStatus.ACCEPTED)
                .build();

        when(userAppService.getMe(FAKE_JWT))
                .thenReturn(EmployerDto.builder().email(EMPLOYER_EMAIL).build());

        // Act
        when(internshipApplicationService.approveInternshipApplication(EMPLOYER_EMAIL, pendingApplication.getId()))
                .thenReturn(approvedApplication);

        // Assert
        mockMvc.perform(put("/api/v1/employer/get-internship-application/1/approve")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("status").value("ACCEPTED"))
                .andExpect(jsonPath("studentEmail").value("student@mail.com"))
                .andExpect(jsonPath("internshipOfferTitle").value("Backend Developer"))
                .andExpect(jsonPath("salary").value("18.25"));
    }

    @Test
    void approveInternshipApplication_shouldReturn400_whenApplicationNotFound() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new EmployerControllerException())
                .build();

        when(userAppService.getMe(FAKE_JWT))
                .thenReturn(EmployerDto.builder().email(EMPLOYER_EMAIL).build());

        // Act
        when(internshipApplicationService.approveInternshipApplication(EMPLOYER_EMAIL, 999L))
                .thenThrow(new InvalidInternshipApplicationException("Internship application not found"));

        // Assert
        MvcResult result = mockMvc.perform(put("/api/v1/employer/get-internship-application/999/approve")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternshipApplicationException);
    }

    @Test
    void approveInternshipApplication_shouldReturn400_whenEmployerNotFound() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new EmployerControllerException())
                .build();

        when(userAppService.getMe(FAKE_JWT))
                .thenReturn(EmployerDto.builder().email(EMPLOYER_EMAIL).build());

        InternshipApplicationResponseDTO application = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .employerEmail("wrong@test.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Backend Developer")
                .salary(18.25f)
                .build();

        // Act
        when(internshipApplicationService.approveInternshipApplication(EMPLOYER_EMAIL, application.getId()))
                .thenThrow(new InvalidInternshipApplicationException("Invalid application"));

        // Assert
        MvcResult result = mockMvc.perform(put("/api/v1/employer/get-internship-application/1/approve")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternshipApplicationException);
    }

    @Test
    void rejectInternshipApplication_shouldReturn201() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new EmployerControllerException())
                .build();

        InternshipApplicationResponseDTO pendingApp = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Backend Developer")
                .salary(18.25f)
                .build();

        String reason = "We are asking for 13 years of experience, while you have zero.";
        InternshipApplicationResponseDTO rejectedApp = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Backend Developer")
                .salary(18.25f)
                .status(ApprovalStatus.REJECTED)
                .reason(reason)
                .build();

        when(userAppService.getMe(FAKE_JWT))
                .thenReturn(EmployerDto.builder().email(EMPLOYER_EMAIL).build());

        // Act
        when(internshipApplicationService.rejectInternshipApplication(EMPLOYER_EMAIL, pendingApp.getId(), reason))
                .thenReturn(rejectedApp);

        // Assert
        mockMvc.perform(put("/api/v1/employer/get-internship-application/1/reject")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .content(reason)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("status").value("REJECTED"))
                .andExpect(jsonPath("studentEmail").value("student@mail.com"))
                .andExpect(jsonPath("internshipOfferTitle").value("Backend Developer"))
                .andExpect(jsonPath("salary").value("18.25"))
                .andExpect(jsonPath("reason").value(reason));
    }

    @Test
    void rejectInternshipApplication_shouldReturn400_whenApplicationNotFound() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new EmployerControllerException())
                .build();

        when(userAppService.getMe(FAKE_JWT))
                .thenReturn(EmployerDto.builder().email(EMPLOYER_EMAIL).build());

        String reason = "Raison parfaitement générique.";

        // Act
        when(internshipApplicationService.rejectInternshipApplication(EMPLOYER_EMAIL, 999L, reason))
                .thenThrow(new InvalidInternshipApplicationException("Internship application not found"));

        // Assert
        MvcResult result = mockMvc.perform(put("/api/v1/employer/get-internship-application/999/reject")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .content(reason)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternshipApplicationException);
    }

    @Test
    void rejectInternshipApplication_shouldReturn400_whenEmployerNotFound() throws Exception {
        // Arrange
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(employerController)
                .setControllerAdvice(new EmployerControllerException())
                .build();

        when(userAppService.getMe(FAKE_JWT))
                .thenReturn(EmployerDto.builder().email(EMPLOYER_EMAIL).build());

        String reason = "Sorry, but we are only looking for backend developpers.";
        InternshipApplicationResponseDTO application = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .employerEmail("wrong@test.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Backend Developer")
                .salary(18.25f)
                .build();

        // Act
        when(internshipApplicationService.rejectInternshipApplication(EMPLOYER_EMAIL, application.getId(), reason))
                .thenThrow(new InvalidInternshipApplicationException("Invalid application"));

        // Assert
        MvcResult result = mockMvc.perform(put("/api/v1/employer/get-internship-application/1/reject")
                        .header("Authorization", "Bearer " + FAKE_JWT)
                        .content(reason)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertTrue(resolved instanceof InvalidInternshipApplicationException);
    }
}