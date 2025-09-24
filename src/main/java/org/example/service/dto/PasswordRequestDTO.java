package org.example.service.dto;
import lombok.*;



@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PasswordRequestDTO {
    String token;
    String newPassword;
}
