package org.example.presentation.exception;


import lombok.extern.slf4j.Slf4j;
import org.example.security.exception.APIException;
import org.example.security.exception.InvalidJwtTokenException;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.ErrorResponseDTO;
import org.example.service.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class EmployerControllerException {
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

    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<ProblemDetail> handleDuplicate(DuplicateUserException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage()));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleUserNotFound(UserNotFoundException ex) {
        log.error("e: ", ex);
        return buildError(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(CvNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleCvNotFound(CvNotFoundException ex) {
        return buildError(HttpStatus.NOT_FOUND, "CV_NOT_FOUND", ex.getMessage());
    }


    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDTO> handleAccessDenied(AccessDeniedException ex) {
        return buildError(HttpStatus.FORBIDDEN, "ACCESS_DENIED", ex.getMessage());
    }

    @ExceptionHandler(FileProcessingException.class)
    public ResponseEntity<ErrorResponseDTO> handleFileProcessing(FileProcessingException ex) {
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, "FILE_PROCESSING_ERROR", ex.getMessage());
    }

    @ExceptionHandler(APIException.class)
    public ResponseEntity<ErrorResponseDTO> handleApi(APIException ex) {
        return buildError(ex.getStatus(), "API_ERROR", ex.getMessage());
    }

    @ExceptionHandler(InvalidFileFormatException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidFile(InvalidFileFormatException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "INVALID_FILE", ex.getMessage());
    }

    @ExceptionHandler(UserSettingsNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleUserSettingsNotFound(UserSettingsNotFoundException ex) {
        return buildError(HttpStatus.OK, "USER_SETTINGS_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(InvalidJwtTokenException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidJwt(InvalidJwtTokenException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, "INVALID_JWT_TOKEN", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(Exception ex) {
        System.out.println(ex);
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
