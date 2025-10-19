package org.example.service;


import lombok.RequiredArgsConstructor;
import org.example.model.*;
import org.example.repository.*;
import org.example.security.JwtTokenProvider;
import org.example.security.exception.UserNotFoundException;
import org.example.service.dto.*;
import org.example.service.exception.UserSettingsNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserAppService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserAppRepository userAppRepository;
    private final EmployerRepository employerRepository;
    private final EtudiantRepository studentRepository;
    private final GestionnaireRepository gestionnaireRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserSettingsRepository userSettingsRepository;



    public String authenticateUser(LoginDTO loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));
        final String token = jwtTokenProvider.generateToken(authentication);
        return token;
    }

    public UserDTO getMe(String token) {
        token = token.startsWith("Bearer") ? token.substring(7) : token;
        String email = jwtTokenProvider.getEmailFromJWT(token);
        UserApp user = userAppRepository.findUserAppByEmail(email).orElseThrow(() -> new UserNotFoundException("Étudiant introuvable avec email " + email));
        return switch(user.getRole()){
            case EMPLOYER -> getEmployerDTO(user.getId());
            case STUDENT -> getStudentDTO(user.getId());
            case GESTIONNAIRE -> getGestionnaireDTO(user.getId());
        };
    }

    private EmployerDto getEmployerDTO(Long id) {
        final Optional<Employer>  employerOptional = employerRepository.findById(id);
        return employerOptional.isPresent() ?
                EmployerDto.create(employerOptional.get()) :
                EmployerDto.empty();
    }


    private EtudiantDTO getStudentDTO(Long id) {
        final Optional<Etudiant>  studentOptional = studentRepository.findById(id);
        return studentOptional.isPresent() ?
                EtudiantDTO.fromEntity(studentOptional.get()) :
                EtudiantDTO.empty();
    }

    private GestionnaireDTO getGestionnaireDTO(Long id) {
        final Optional<Gestionnaire> gestionnaireOptional = gestionnaireRepository.findById(id);
        return gestionnaireOptional.isPresent() ?
                GestionnaireDTO.fromEntity(gestionnaireOptional.get()) :
                GestionnaireDTO.empty();
    }

    public UserSettingsDto getMySettings(Long userId) {
        UserSettings settings = userSettingsRepository.findByUserId(userId);
        if (settings == null) {
            throw new UserSettingsNotFoundException("Aucun paramètre trouvé pour l'utilisateur avec l'ID " + userId);
        }
        return UserSettingsDto.fromEntity(settings);
    }

    @Transactional
    public UserSettingsDto updateMySettings(Long userId, UserSettingsDto dto) {
        UserApp user = userAppRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur introuvable avec id " + userId));

        UserSettings settings = userSettingsRepository.findByUserId(userId);
        if (settings == null) {
            settings = new UserSettings();
            settings.setUser(user);
        }

        if (dto.getLanguage() != null) {
            settings.setLanguage(dto.getLanguage());
        }

        userSettingsRepository.save(settings);
        return UserSettingsDto.fromEntity(settings);
    }
}

