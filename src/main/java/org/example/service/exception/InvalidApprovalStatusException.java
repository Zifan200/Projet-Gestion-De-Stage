package org.example.service.exception;

public class InvalidApprovalStatusException extends RuntimeException {
    public InvalidApprovalStatusException(String message) {
        super(message);
    }
}
