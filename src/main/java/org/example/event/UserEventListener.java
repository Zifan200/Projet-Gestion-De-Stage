package org.example.event;


import lombok.RequiredArgsConstructor;
import org.example.model.EmailMessage;
import org.example.model.EmailMessage;
import org.example.service.EmailService;
import org.example.utils.EmailTemplate;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserEventListener {
    private final EmailService emailService;

    @EventListener
    public void handleEmployerCreated(UserCreatedEvent event) {
        var employer = event.getUser();

        emailService.sendEmail(
                EmailMessage.builder()
                        .to(employer.getEmail())
                        .subject("🎉 Compte créé avec succès !")
                        .body(EmailTemplate.CreateAccount(employer.getFirstName()))
                        .build()
        );
    }
}
