package org.example.presentation.exception;

import lombok.extern.slf4j.Slf4j;
import org.example.security.exception.APIException;
import org.example.service.dto.ErrorResponseDTO;
import org.example.service.exception.InvalidInternShipOffer;
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
public class InternshipOfferControllerException {

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

    @ExceptionHandler(InvalidInternShipOffer.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidInternShip(InvalidInternShipOffer ex) {
        return buildError(HttpStatus.BAD_REQUEST, "Invalid Internship offer", ex.getMessage());
    }

    @ExceptionHandler(APIException.class)
    public ResponseEntity<ErrorResponseDTO> handleApi(APIException ex) {
        return buildError(ex.getStatus(), "API_ERROR", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(Exception ex) {
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
