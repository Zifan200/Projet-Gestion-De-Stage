package org.example.security.exception;

import org.springframework.http.HttpStatus;

public class UsedEmailAddressException extends APIException {
    public UsedEmailAddressException(HttpStatus status, String message) {
        super(status, message);
    }
}
