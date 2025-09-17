package org.example.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@Getter
@Setter
@ToString
public class EmailMessage {
    @Email
    @NotBlank
    private String to;
    @NotBlank(message = "Subject in mandatory (min 4)")
    @Size(min = 4)
    private String subject;
    @NotBlank(message = "Body in mandatory (min 20)")
    @Size(min = 20)
    private String body;

    @Builder
    public EmailMessage(String to, String subject, String body) {
        this.to = to;
        this.subject = subject;
        this.body = body;
    }
}
