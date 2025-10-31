package org.example.event;

import lombok.Getter;
import org.example.model.Convocation;
import org.example.model.enums.ApprovalStatus;
import org.example.service.NotificationService;
import org.springframework.context.event.EventListener;


public class ConvocationStatusChangedEvent {

    @Getter
    private final Convocation convocation;

    private final NotificationService notificationService;

    public ConvocationStatusChangedEvent(Convocation convocation, NotificationService notificationService) {
        this.convocation = convocation;
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleConvocationStatusChanged(ConvocationStatusChangedEvent event) {
        Convocation convocation = event.getConvocation();

        String message = convocation.getStatus() == ApprovalStatus.ACCEPTED

                ? "L’étudiant " + convocation.getEtudiant().getFirstName() + " " + convocation.getEtudiant().getLastName()
                + " a accepté votre convocation."

                : "L’étudiant " + convocation.getEtudiant().getFirstName() + " " + convocation.getEtudiant().getLastName()
                + " a refusé votre convocation.";

        notificationService.notifyEmployer(convocation.getEmployer(), "Réponse à la convocation", message);
    }
}
