package org.example.service;

import org.example.model.UserApp;
import org.example.model.UserSettings;
import org.example.repository.UserAppRepository;
import org.example.repository.UserSettingsRepository;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.util.UserSettingsDto;
import org.example.service.exception.UserSettingsNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserAppSettingsTest {

    @Mock
    private UserAppRepository userAppRepository;

    @Mock
    private UserSettingsRepository userSettingsRepository;

    @InjectMocks
    private UserAppService userAppService;

    private UserApp testUser;
    private UserSettings testUserSettings;

    @BeforeEach
    void setUp() {
        testUser = new UserApp() {};
        testUser.setId(1L);

        testUserSettings = new UserSettings();
        testUserSettings.setId(10L);
        testUserSettings.setUser(testUser);
        testUserSettings.setLanguage("es");
    }

    @Test
    void testGetMySettings_WhenSettingsExist() {
        when(userSettingsRepository.findByUserId(1L)).thenReturn(testUserSettings);

        UserSettingsDto dto = userAppService.getMySettings(1L);

        assertNotNull(dto);
        assertEquals("es", dto.getLanguage());
        verify(userSettingsRepository, times(1)).findByUserId(1L);
    }

    @Test
    void testGetMySettings_WhenNoSettingsExist_ThrowsException() {
        when(userSettingsRepository.findByUserId(1L)).thenReturn(null);

        assertThrows(UserSettingsNotFoundException.class,
                () -> userAppService.getMySettings(1L));

        verify(userSettingsRepository, times(1)).findByUserId(1L);
    }

    @Test
    void testUpdateMySettings_WhenUserExistsAndSettingsExist() {
        when(userAppRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userSettingsRepository.findByUserId(1L)).thenReturn(testUserSettings);

        UserSettingsDto dto = new UserSettingsDto();
        dto.setLanguage("fr");

        UserSettingsDto updated = userAppService.updateMySettings(1L, dto);

        assertNotNull(updated);
        assertEquals("fr", updated.getLanguage());

        verify(userAppRepository, times(1)).findById(1L);
        verify(userSettingsRepository, times(1)).save(any(UserSettings.class));
    }

    @Test
    void testUpdateMySettings_WhenUserExistsAndNoSettingsExist() {
        when(userAppRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userSettingsRepository.findByUserId(1L)).thenReturn(null);

        UserSettingsDto dto = new UserSettingsDto();
        dto.setLanguage("en");

        ArgumentCaptor<UserSettings> captor = ArgumentCaptor.forClass(UserSettings.class);

        UserSettingsDto updated = userAppService.updateMySettings(1L, dto);

        assertNotNull(updated);
        assertEquals("en", updated.getLanguage());
        verify(userSettingsRepository).save(captor.capture());

        UserSettings saved = captor.getValue();
        assertEquals(testUser, saved.getUser());
        assertEquals("en", saved.getLanguage());
    }

    @Test
    void testUpdateMySettings_WhenUserDoesNotExist() {
        when(userAppRepository.findById(1L)).thenReturn(Optional.empty());

        UserSettingsDto dto = new UserSettingsDto();
        dto.setLanguage("de");

        assertThrows(UserNotFoundException.class,
                () -> userAppService.updateMySettings(1L, dto));

        verify(userSettingsRepository, never()).save(any());
    }
}