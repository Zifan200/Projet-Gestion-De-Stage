package org.example.service.exception;

public class InvalidFileFormatException  extends RuntimeException {
    public InvalidFileFormatException(String message) {
        super(message);
    }
}
