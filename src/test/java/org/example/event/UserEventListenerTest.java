package org.example.event;

import org.example.service.EmailService;
import org.example.service.dto.UserDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.example.event.PasswordResetRequestEvent;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserEventListenerTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserEventListener listener;

    @Test
    void testHandlePasswordResetEmail() {
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail("test@example.com");
        userDTO.setFirstName("John");

        PasswordResetRequestEvent event = new PasswordResetRequestEvent(userDTO, "token123");

        listener.handlePasswordResetRequest(event);

        verify(emailService, times(1)).sendEmail(argThat(emailMessage ->
                emailMessage.getTo().equals("test@example.com") &&
                        emailMessage.getBody().contains("token123")
        ));
    }
}