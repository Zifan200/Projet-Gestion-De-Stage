package org.example.event;

import lombok.Getter;
import org.example.service.dto.util.UserDTO;

@Getter
public class PasswordResetRequestEvent {
    private final UserDTO user;
    private final String resetToken;

    public PasswordResetRequestEvent(UserDTO user, String resetToken) {
        this.user = user;
        this.resetToken = resetToken;
    }
}
