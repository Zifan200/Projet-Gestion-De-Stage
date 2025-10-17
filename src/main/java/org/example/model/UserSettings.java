package org.example.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Locale;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserApp user;

    private String language;

    public UserSettings(UserApp user, String language) {
        this.user = user;
        this.language = language;
    }
}