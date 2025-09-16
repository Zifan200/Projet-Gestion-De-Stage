package org.example.presentation.exception;


import org.example.service.exception.DuplicateUserException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class UserNotFoundException {
    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<ProblemDetail> handleDomain(DuplicateUserException ex, WebRequest req) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(problemDetail);
    }
}
