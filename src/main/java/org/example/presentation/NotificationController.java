package org.example.presentation;

import lombok.AllArgsConstructor;
import org.example.service.dto.util.NotificationDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@AllArgsConstructor
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyUser(String destination, NotificationDTO notificationDTO) {
        messagingTemplate.convertAndSend(destination, notificationDTO);
    }
}