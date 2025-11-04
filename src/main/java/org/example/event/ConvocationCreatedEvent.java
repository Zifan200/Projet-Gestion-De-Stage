package org.example.event;

import lombok.Getter;
import org.example.model.Convocation;
import org.example.service.NotificationService;
import org.springframework.context.event.EventListener;


public class ConvocationCreatedEvent {

    @Getter
    private final Convocation convocation;

    private final NotificationService notificationService;

    public ConvocationCreatedEvent (Convocation convocation, NotificationService notificationService) {
        this.convocation = convocation;
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleConvocationCreated(ConvocationCreatedEvent event) {
        Convocation convocation = event.getConvocation();

        notificationService.notifyEtudiant(
                convocation.getEtudiant(),
                "Nouvelle convocation",
                "Vous avez reçu une convocation de " + convocation.getEmployer().getEnterpriseName()
        );
    }
}
