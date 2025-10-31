package org.example.service.dto.util;

import lombok.*;
import org.example.model.UserSettings;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettingsDto {

    private String language;

    public static UserSettingsDto fromEntity(UserSettings userSettings) {
        return UserSettingsDto.builder()
                .language(userSettings.getLanguage())
                .build();
    }
}