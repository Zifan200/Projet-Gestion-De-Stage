package org.example.presentation;

import org.example.model.CV;
import org.example.model.auth.Role;
import org.example.presentation.exception.EmployerControllerException;
import org.example.service.CVService;
import org.example.service.UserAppService;
import org.example.service.dto.CvResponseDTO;
import org.example.service.dto.EtudiantDTO;
import org.example.service.dto.UserDTO;
import org.example.service.exception.AccessDeniedException;
import org.example.service.exception.CvNotFoundException;
import org.example.service.exception.InvalidFileFormatException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CvControllerTest {
    private MockMvc mockMvc;

    @Mock
    private CVService cvService;

    @Mock
    private UserAppService userAppService;

    @InjectMocks
    private CvController cvController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(cvController)
                .setControllerAdvice(new EmployerControllerException())
                .build();
    }

    private static final String AUTH_HEADER = "Authorization";
    private static final String FAKE_JWT = "fake-jwt";
    private static final String EMAIL = "student@mail.com";

    private void mockUser() {
        EtudiantDTO user = EtudiantDTO.builder().email(EMAIL).build();
        when(userAppService.getMe(FAKE_JWT)).thenReturn(user);
    }


    @Test
    void uploadMyCv_shouldReturn201() throws Exception {
        mockUser();
        MockMultipartFile file = new MockMultipartFile(
                "file", "cv.pdf", MediaType.APPLICATION_PDF_VALUE, "dummy-data".getBytes()
        );

        CvResponseDTO dto = CvResponseDTO.builder()
                .id(1L)
                .fileName("cv.pdf")
                .fileType(MediaType.APPLICATION_PDF_VALUE)
                .uploadedAt(LocalDateTime.now())
                .build();

        when(cvService.addCv(eq(EMAIL), any())).thenReturn(dto);

        mockMvc.perform(multipart("/api/v1/student/cv/me/cv")
                        .file(file)
                        .header(AUTH_HEADER, "Bearer " + FAKE_JWT))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fileName").value("cv.pdf"));
    }

    @Test
    void uploadMyCv_shouldReturn400_whenInvalidFile() throws Exception {
        mockUser();

        MockMultipartFile badFile = new MockMultipartFile(
                "file", "bad.txt", "text/plain", "fake content".getBytes()
        );

        when(cvService.addCv(eq(EMAIL), any(MultipartFile.class)))
                .thenThrow(new InvalidFileFormatException("Seuls PDF ou Word sont acceptés"));

        var k = mockMvc.perform(multipart("/api/v1/student/cv/me/cv")
                        .file(badFile)
                        .header("Authorization", "Bearer " + FAKE_JWT))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listMyCvs_shouldReturn200() throws Exception {
        mockUser();
        CvResponseDTO dto = CvResponseDTO.builder()
                .id(1L)
                .fileName("cv.pdf")
                .fileType(MediaType.APPLICATION_PDF_VALUE)
                .uploadedAt(LocalDateTime.now())
                .build();

        when(cvService.listMyCvs(EMAIL)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/student/cv/me")
                        .header(AUTH_HEADER, "Bearer " + FAKE_JWT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fileName").value("cv.pdf"));
    }

    @Test
    void downloadCv_shouldReturn200() throws Exception {
        mockUser();
        CV cv = CV.builder()
                .id(1L)
                .fileName("cv.pdf")
                .fileType(MediaType.APPLICATION_PDF_VALUE)
                .data("hello".getBytes())
                .build();

        when(cvService.downloadCv(1L, EMAIL)).thenReturn(cv);

        mockMvc.perform(get("/api/v1/student/cv/1/download")
                        .header(AUTH_HEADER, "Bearer " + FAKE_JWT))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "inline; filename=\"cv.pdf\""))
                .andExpect(content().bytes("hello".getBytes()));
    }

    @Test
    void downloadCv_shouldReturn404_whenNotFound() throws Exception {
        mockUser();
        when(cvService.downloadCv(99L, EMAIL)).thenThrow(new CvNotFoundException(""));

        mockMvc.perform(get("/api/v1/student/cv/99/download")
                        .header(AUTH_HEADER, "Bearer " + FAKE_JWT))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCv_shouldReturn204() throws Exception {
        mockUser();

        mockMvc.perform(delete("/api/v1/student/cv/1")
                        .header(AUTH_HEADER, "Bearer " + FAKE_JWT))
                .andExpect(status().isNoContent());

        Mockito.verify(cvService).deleteCv(1L, EMAIL);
    }

    @Test
    void deleteCv_shouldReturn403_whenAccessDenied() throws Exception {
        mockUser();
        Mockito.doThrow(new AccessDeniedException("pas le droit"))
                .when(cvService).deleteCv(1L, EMAIL);

        mockMvc.perform(delete("/api/v1/student/cv/1")
                        .header(AUTH_HEADER, "Bearer " + FAKE_JWT))
                .andExpect(status().isForbidden());
    }

}