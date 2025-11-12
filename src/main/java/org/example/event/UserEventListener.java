package org.example.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.model.EmailMessage;
import org.example.service.EmailService;
import org.example.utils.EmailTemplate;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventListener {

    private final EmailService emailService;

    @EventListener
    public void handleEmployerCreated(UserCreatedEvent event) {
        var employer = event.getUser();

        try {
            emailService.sendEmail(
                EmailMessage.builder()
                    .to(employer.getEmail())
                    .subject("🎉 Compte créé avec succès !")
                    .body(EmailTemplate.CreateAccount(employer.getFirstName()))
                    .build()
            );
            log.info(
                "Welcome email sent successfully to: {}",
                employer.getEmail()
            );
        } catch (Exception e) {
            log.error(
                "Failed to send welcome email to: {}. Error: {}",
                employer.getEmail(),
                e.getMessage()
            );
            // Don't throw - allow application to continue even if email fails
        }
    }

    @EventListener
    public void handlePasswordResetRequest(PasswordResetRequestEvent event) {
        var user = event.getUser();
        String resetLink =
            "http://localhost:5173/reset-password?token=" +
            event.getResetToken();

        try {
            emailService.sendEmail(
                EmailMessage.builder()
                    .to(user.getEmail())
                    .subject("Réinitialisation de votre mot de passe")
                    .body(
                        EmailTemplate.ResetPassword(
                            user.getFirstName(),
                            resetLink
                        )
                    )
                    .build()
            );
            log.info(
                "Password reset email sent successfully to: {}",
                user.getEmail()
            );
        } catch (Exception e) {
            log.error(
                "Failed to send password reset email to: {}. Error: {}",
                user.getEmail(),
                e.getMessage()
            );
            // Don't throw - allow application to continue even if email fails
        }
    }
}
