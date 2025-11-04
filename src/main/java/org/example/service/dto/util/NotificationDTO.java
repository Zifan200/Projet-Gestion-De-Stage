package org.example.service.dto.util;

import lombok.*;
import org.example.model.Notification;
import java.time.LocalDateTime;


@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private LocalDateTime createdAt;
    private String senderType;

    public static NotificationDTO createDTO(Notification notification) {
        String senderType = notification.getEtudiant() != null ? "Etudiant" :
                notification.getEmployer() != null ? "Employer" : "Gestionnaire";

        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .createdAt(notification.getCreatedAt())
                .senderType(senderType)
                .build();
    }
}