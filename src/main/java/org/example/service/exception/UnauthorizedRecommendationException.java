package org.example.service.exception;

public class UnauthorizedRecommendationException extends RuntimeException {
    public UnauthorizedRecommendationException(String message) {
        super(message);
    }
}
