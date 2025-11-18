package org.example.presentation.exception;

import lombok.extern.slf4j.Slf4j;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.util.ErrorResponseDTO;
import org.example.service.exception.MaxGoldRecommendationsException;
import org.example.service.exception.RecommendationNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class InternshipRecommendationControllerException {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage()));

        body.put("details", fieldErrors);
        body.put("timestamp", LocalDateTime.now());

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleUserNotFound(UserNotFoundException ex) {
        log.error("User not found: {}", ex.getMessage());
        return buildError(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(RecommendationNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleRecommendationNotFound(RecommendationNotFoundException ex) {
        log.error("Recommendation not found: {}", ex.getMessage());
        return buildError(HttpStatus.NOT_FOUND, "RECOMMENDATION_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(MaxGoldRecommendationsException.class)
    public ResponseEntity<ErrorResponseDTO> handleMaxGoldRecommendations(MaxGoldRecommendationsException ex) {
        log.warn("Max gold recommendations exceeded: {}", ex.getMessage());
        return buildError(HttpStatus.BAD_REQUEST, "MAX_GOLD_RECOMMENDATIONS_EXCEEDED", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        ErrorResponseDTO error = new ErrorResponseDTO(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_ERROR",
                "Une erreur inattendue est survenue",
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private ResponseEntity<ErrorResponseDTO> buildError(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(
                new ErrorResponseDTO(status.value(), code, message, LocalDateTime.now())
        );
    }
}
