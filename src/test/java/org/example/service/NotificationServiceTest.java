package org.example.service;

import org.example.model.*;
import org.example.presentation.NotificationController;
import org.example.repository.NotificationRepository;
import org.example.service.dto.util.NotificationDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;

class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationController socketController;

    @InjectMocks
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void notifyEtudiant_shouldSaveAndNotify() {
        Etudiant etudiant = new Etudiant();
        etudiant.setId(1L);

        Notification saved = Notification.builder()
                .id(10L)
                .etudiant(etudiant)
                .title("Test")
                .message("Message étudiant")
                .build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        NotificationDTO dto = notificationService.notifyEtudiant(etudiant, "Test", "Message étudiant");

        verify(notificationRepository).save(any(Notification.class));
        verify(socketController).notifyUser("/queue/etudiant/1", NotificationDTO.createDTO(saved));
        assertThat(dto.getId()).isEqualTo(10L);
        assertThat(dto.getTitle()).isEqualTo("Test");
    }

    @Test
    void notifyEmployer_shouldSaveAndNotify() {
        Employer employer = new Employer();
        employer.setId(2L);

        Notification saved = Notification.builder()
                .id(20L)
                .employer(employer)
                .title("Titre")
                .message("Message employer")
                .build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        NotificationDTO dto = notificationService.notifyEmployer(employer, "Titre", "Message employer");

        verify(notificationRepository).save(any(Notification.class));
        verify(socketController).notifyUser("/queue/employer/2", NotificationDTO.createDTO(saved));
        assertThat(dto.getMessage()).isEqualTo("Message employer");
    }

    @Test
    void notifyGestionnaire_shouldSaveAndNotify() {
        Gestionnaire gestionnaire = new Gestionnaire();
        gestionnaire.setId(3L);

        Notification saved = Notification.builder()
                .id(30L)
                .gestionnaire(gestionnaire)
                .title("Titre G")
                .message("Message gestionnaire")
                .build();


        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        NotificationDTO dto = notificationService.notifyGestionnaire(gestionnaire, "Titre G",
                "Message gestionnaire");

        verify(notificationRepository).save(any(Notification.class));
        verify(socketController).notifyUser("/queue/gestionnaire/3", NotificationDTO.createDTO(saved));
        assertThat(dto.getMessage()).isEqualTo("Message gestionnaire");
    }

    @Test
    void getNotificationsForEtudiant_shouldReturnList() {
        when(notificationRepository.findAllByEtudiantCredentialsEmail("etu@mail.com"))
                .thenReturn(List.of(Notification.builder().id(1L).build()));

        List<NotificationDTO> list = notificationService.getNotificationsForEtudiant("etu@mail.com");

        verify(notificationRepository).findAllByEtudiantCredentialsEmail("etu@mail.com");
        assertThat(list).hasSize(1);
    }
}
