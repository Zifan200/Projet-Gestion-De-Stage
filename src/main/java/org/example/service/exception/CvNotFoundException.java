package org.example.service.exception;

public class CvNotFoundException extends RuntimeException {
    public CvNotFoundException(String message) {
        super(message);
    }
}
