package org.example.repository;

import org.example.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByEtudiantCredentialsEmail(String email);
    List<Notification> findAllByEmployerCredentialsEmail(String email);
    List<Notification> findAllByGestionnaireCredentialsEmail(String email);
}
