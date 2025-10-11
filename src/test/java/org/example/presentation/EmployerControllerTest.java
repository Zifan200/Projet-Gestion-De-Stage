package org.example.presentation;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.presentation.exception.EmployerControllerException;
import org.example.presentation.exception.InternshipOfferControllerException;
import org.example.service.EmployerService;
import org.example.service.InternshipOfferService;
import org.example.service.UserAppService;
import org.example.service.dto.*;
import org.example.service.exception.DuplicateUserException;
import org.example.service.exception.InvalidInternShipOffer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
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


    @InjectMocks
    private EmployerController employerController;

    private static final String AUTH_HEADER = "Authorization";
    private static final String FAKE_JWT = "fake-jwt";
    private static final String EMAIL = "student@mail.com";


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
                .build();

        InternshipOfferResponseDto internshipResponseDto = InternshipOfferResponseDto.builder()
                .title(internshipOfferDto.getTitle())
                .description(internshipOfferDto.getDescription())
                .employerEmail(employerDto.getEmail())
                .target_programme(internshipOfferDto.getTargetedProgramme())
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
                .andExpect(jsonPath("$.targetedProgramme").value("Computer Science"));
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
                .build();

        InternshipOfferResponseDto internshipResponseDto = InternshipOfferResponseDto.builder()
                .title(internshipOfferDto.getTitle())
                .description(internshipOfferDto.getDescription())
                .employerEmail(employerDto.getEmail())
                .target_programme(internshipOfferDto.getTargetedProgramme())
                .build();

        // Arrange mocks
        when(userAppService.getMe(FAKE_JWT)).thenReturn(employerDto);
        when(internshipOfferService.saveInternshipOffer(employerDto.getEmail(), internshipOfferDto)).thenThrow(new InvalidInternShipOffer(""));


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
}