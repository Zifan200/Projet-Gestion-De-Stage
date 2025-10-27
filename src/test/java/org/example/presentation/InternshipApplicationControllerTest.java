package org.example.presentation;

import org.example.model.enums.ApprovalStatus;
import org.example.presentation.exception.InternshipApplicationControllerException;
import org.example.service.InternshipApplicationService;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.exception.InvalidApprovalStatus;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class InternshipApplicationControllerTest {

    @Mock
    private InternshipApplicationService internshipApplicationService;

    @InjectMocks
    private InternshipApplicationController internshipApplicationController;
    private final String path = "/api/v1/internship-applications";
    @Test
    void getAllInternshipApplications_shouldReturn200() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipApplicationController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        InternshipApplicationResponseDTO responseDto = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Java Developer")
                .build();

        when(internshipApplicationService.getAllApplications()).thenReturn(List.of(responseDto));

        mockMvc.perform(get(path+"/get-all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentEmail").value("student@mail.com"))
                .andExpect(jsonPath("$[0].internshipOfferTitle").value("Java Developer"));
    }

    @Test
    void getAllInternshipApplicationsWithStatus_shouldReturn200() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipApplicationController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        InternshipApplicationResponseDTO responseDto = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Backend Developer")
                .build();

        when(internshipApplicationService.getAllApplicationsWithStatus("PENDING"))
                .thenReturn(List.of(responseDto));

        mockMvc.perform(get(path+"/get-all/PENDING")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentEmail").value("student@mail.com"))
                .andExpect(jsonPath("$[0].internshipOfferTitle").value("Backend Developer"));
    }

    @Test
    void getAllInternshipApplicationsWithStatus_shouldReturn400_whenInvalidStatus() throws Exception {
        //assign
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipApplicationController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        when(internshipApplicationService.getAllApplicationsWithStatus("REJECTED"))
                .thenThrow(new InvalidApprovalStatus("Invalid status"));


        //act
        MvcResult result = mockMvc.perform(get(path+"/get-all/REJECTED")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();
        Exception resolved = result.getResolvedException();

        //assert
        assertNotNull(resolved);
        assertInstanceOf(InvalidApprovalStatus.class, resolved);
    }

    @Test
    void getAllInternshipApplicationsFromOffer_shouldReturn200() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipApplicationController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        InternshipApplicationResponseDTO responseDto = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Java Developer")
                .build();

        when(internshipApplicationService.getAllApplicationsFromOffer(10L))
                .thenReturn(List.of(responseDto));

        mockMvc.perform(get(path+"/get-all/internship-offer/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentEmail").value("student@mail.com"))
                .andExpect(jsonPath("$[0].internshipOfferTitle").value("Java Developer"));
    }

    @Test
    void getAllInternshipApplicationsFromOffer_shouldReturn400_whenOfferDoesNotExist() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipApplicationController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        when(internshipApplicationService.getAllApplicationsFromOffer(999L))
                .thenThrow(new InvalidInternshipApplicationException("Offer does not exist"));

        MvcResult result = mockMvc.perform(get(path+"/get-all/internship-offer/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertInstanceOf(InvalidInternshipApplicationException.class, resolved);
    }

    @Test
    void getAllInternshipApplicationsFromOfferWithStatus_shouldReturn200() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(internshipApplicationController).setControllerAdvice(new InternshipApplicationControllerException()).build();

        InternshipApplicationResponseDTO responseDto = InternshipApplicationResponseDTO.builder()
                .id(1L)
                .studentEmail("student@mail.com")
                .internshipOfferId(10L)
                .internshipOfferTitle("Backend Developer")
                .status(ApprovalStatus.PENDING)
                .build();

        when(internshipApplicationService.getAllApplicationsFromOfferWithStatus(10L, "PENDING"))
                .thenReturn(List.of(responseDto));

        mockMvc.perform(get(path+"/get-all/PENDING/internship-offer/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentEmail").value("student@mail.com"))
                .andExpect(jsonPath("$[0].internshipOfferTitle").value("Backend Developer"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void getAllInternshipApplicationsFromOfferWithStatus_shouldReturn400_whenInvalidStatus() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipApplicationController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        when(internshipApplicationService.getAllApplicationsFromOfferWithStatus(10L, "INVALID"))
                .thenThrow(new InvalidApprovalStatus("Invalid status"));

        MvcResult result = mockMvc.perform(get(path+"/get-all/INVALID/internship-offer/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertInstanceOf(InvalidApprovalStatus.class, resolved);
    }

    @Test
    void getAllInternshipApplicationsFromOfferWithStatus_shouldReturn400_whenOfferDoesNotExist() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(internshipApplicationController)
                .setControllerAdvice(new InternshipApplicationControllerException())
                .build();

        when(internshipApplicationService.getAllApplicationsFromOfferWithStatus(999L, "PENDING"))
                .thenThrow(new InvalidInternshipApplicationException("Offer does not exist"));

        MvcResult result = mockMvc.perform(get(path+"/get-all/PENDING/internship-offer/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andReturn();

        Exception resolved = result.getResolvedException();
        assertNotNull(resolved);
        assertInstanceOf(InvalidInternshipApplicationException.class, resolved);
    }
}

