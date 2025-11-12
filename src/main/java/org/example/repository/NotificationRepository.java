package org.example.repository;

import java.util.List;
import org.example.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository
    extends JpaRepository<Notification, Long> {
    List<Notification> findAllByEtudiantCredentialsEmail(String email);
    List<Notification> findAllByEmployerCredentialsEmail(String email);
    List<Notification> findAllByGestionnaireCredentialsEmail(String email);
    List<Notification> findAllByTeacherCredentialsEmail(String email);
}
