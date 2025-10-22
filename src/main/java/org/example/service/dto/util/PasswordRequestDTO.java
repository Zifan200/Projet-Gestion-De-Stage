package org.example.service.dto.util;
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
