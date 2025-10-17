package org.example.service.exception;

public class InvalidApprovalStatus extends RuntimeException {
    public InvalidApprovalStatus(String message) {
        super(message);
    }
}
