package org.example.event;

import lombok.Getter;
import org.example.model.Employer;
import org.example.model.UserApp;



@Getter
public class UserCreatedEvent {
    private final UserApp user;

    public UserCreatedEvent(UserApp user) {
        this.user = user;
    }
}