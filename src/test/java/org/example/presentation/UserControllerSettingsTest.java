package org.example.presentation;

import org.example.presentation.exception.EmployerControllerException;
import org.example.security.exception.UserNotFoundException;
import org.example.service.UserAppService;
import org.example.service.dto.UserDTO;
import org.example.service.dto.UserSettingsDto;
import org.example.service.exception.UserSettingsNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerSettingsTest {

    private MockMvc mockMvc;

    @Mock
    private UserAppService userAppService;

    @InjectMocks
    private UserController userController;

    private static final String AUTH_HEADER = "Authorization";
    private static final String FAKE_JWT_HEADER = "Bearer fake-jwt";
    private static final String FAKE_JWT_TOKEN  = "fake-jwt";

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(userController)
                .setControllerAdvice(new EmployerControllerException())
                .build();
    }

    private void mockUserFromJwt() {
        UserDTO me = new UserDTO();
        me.setId(1L);
        me.setEmail("user@mail.com");
        when(userAppService.getMe(FAKE_JWT_TOKEN)).thenReturn(me);
    }

    @Test
    void getMySettings_shouldReturn200_withEnvelope_whenFound() throws Exception {
        mockUserFromJwt();

        UserSettingsDto settings = UserSettingsDto.builder()
                .language("fr")
                .build();

        when(userAppService.getMySettings(1L)).thenReturn(settings);

        mockMvc.perform(get("/api/v1/user/settings")
                        .header(AUTH_HEADER, FAKE_JWT_HEADER))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.data.language").value("fr"));
    }

    @Test
    void getMySettings_shouldReturn404_whenNotFound() throws Exception {
        mockUserFromJwt();
        when(userAppService.getMySettings(1L))
                .thenThrow(new UserSettingsNotFoundException("Aucun paramètre trouvé"));

        mockMvc.perform(get("/api/v1/user/settings")
                        .header(AUTH_HEADER, FAKE_JWT_HEADER))
                .andExpect(status().isOk());
    }

    @Test
    void updateMySettings_shouldReturn200_withEnvelope_whenUpdated() throws Exception {
        mockUserFromJwt();

        UserSettingsDto response = UserSettingsDto.builder()
                .language("en")
                .build();

        when(userAppService.updateMySettings(eq(1L), any(UserSettingsDto.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/user/settings")
                        .header(AUTH_HEADER, FAKE_JWT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"language\":\"en\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.language").value("en"));
    }

    @Test
    void updateMySettings_shouldReturn404_whenUserNotFound() throws Exception {
        mockUserFromJwt();
        when(userAppService.updateMySettings(eq(1L), any(UserSettingsDto.class)))
                .thenThrow(new UserNotFoundException("userNotFound"));

        mockMvc.perform(put("/api/v1/user/settings")
                        .header(AUTH_HEADER, FAKE_JWT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"language\":\"it\"}"))
                .andExpect(status().isNotFound());
    }
}