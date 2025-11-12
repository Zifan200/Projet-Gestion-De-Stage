package org.example.service;

import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.example.model.Employer;
import org.example.model.Etudiant;
import org.example.model.Gestionnaire;
import org.example.model.Notification;
import org.example.model.Teacher;
import org.example.presentation.NotificationController;
import org.example.repository.NotificationRepository;
import org.example.service.dto.util.NotificationDTO;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationController socketController;

    public NotificationDTO notifyEtudiant(
        Etudiant etudiant,
        String title,
        String message
    ) {
        Notification notification = Notification.builder()
            .etudiant(etudiant)
            .title(title)
            .message(message)
            .build();

        NotificationDTO saved = NotificationDTO.createDTO(
            notificationRepository.save(notification)
        );
        socketController.notifyUser(
            "/queue/etudiant/" + etudiant.getId(),
            saved
        );
        return saved;
    }

    public NotificationDTO notifyEmployer(
        Employer employer,
        String title,
        String message
    ) {
        Notification notification = Notification.builder()
            .employer(employer)
            .title(title)
            .message(message)
            .build();
        NotificationDTO saved = NotificationDTO.createDTO(
            notificationRepository.save(notification)
        );
        socketController.notifyUser(
            "/queue/employer/" + employer.getId(),
            saved
        );
        return saved;
    }

    public NotificationDTO notifyGestionnaire(
        Gestionnaire gestionnaire,
        String title,
        String message
    ) {
        Notification notification = Notification.builder()
            .gestionnaire(gestionnaire)
            .title(title)
            .message(message)
            .build();
        NotificationDTO saved = NotificationDTO.createDTO(
            notificationRepository.save(notification)
        );
        socketController.notifyUser(
            "/queue/gestionnaire/" + gestionnaire.getId(),
            saved
        );
        return saved;
    }

    public List<NotificationDTO> getNotificationsForEtudiant(String email) {
        List<Notification> listeNotifications =
            notificationRepository.findAllByEtudiantCredentialsEmail(email);
        return listeNotifications
            .stream()
            .map(NotificationDTO::createDTO)
            .collect(Collectors.toList());
    }

    public List<NotificationDTO> getNotificationsForEmployer(String email) {
        List<Notification> listeNotifications =
            notificationRepository.findAllByEmployerCredentialsEmail(email);
        return listeNotifications
            .stream()
            .map(NotificationDTO::createDTO)
            .collect(Collectors.toList());
    }

    public List<NotificationDTO> getNotificationsForGestionnaire(String email) {
        List<Notification> listeNotifications =
            notificationRepository.findAllByGestionnaireCredentialsEmail(email);
        return listeNotifications
            .stream()
            .map(NotificationDTO::createDTO)
            .collect(Collectors.toList());
    }

    public NotificationDTO notifyTeacher(
        Teacher teacher,
        String title,
        String message
    ) {
        Notification notification = Notification.builder()
            .teacher(teacher)
            .title(title)
            .message(message)
            .build();
        NotificationDTO saved = NotificationDTO.createDTO(
            notificationRepository.save(notification)
        );
        socketController.notifyUser("/queue/teacher/" + teacher.getId(), saved);
        return saved;
    }

    public List<NotificationDTO> getNotificationsForTeacher(String email) {
        List<Notification> listeNotifications =
            notificationRepository.findAllByTeacherCredentialsEmail(email);
        return listeNotifications
            .stream()
            .map(NotificationDTO::createDTO)
            .collect(Collectors.toList());
    }
}
