package org.example.service;

import org.example.model.Gestionnaire;
import org.example.model.auth.Role;
import org.example.repository.GestionnaireRepository;
import org.example.service.dto.GestionnaireDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GestionnaireServiceTest {

    @Mock
    private GestionnaireRepository gestionnaireRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @Test
    void testGestionnaireCreation() {
        GestionnaireDTO gestionnaireDTO = GestionnaireDTO.builder()
                .lastName("Doe")
                .firstName("John")
                .email("john.doe@example.com")
                .password("password")
                .role(Role.GESTIONNAIRE)
                .phone("123-456-7890")
                .since(LocalDate.now())
                .build();

        when (passwordEncoder.encode(gestionnaireDTO.getPassword()))
                .thenReturn("password");
        when(gestionnaireRepository.save(any(Gestionnaire.class)))
                .thenAnswer(invocation -> (Gestionnaire) invocation.getArgument(0));

        GestionnaireDTO savedGestionnaire = gestionnaireService.saveGestionnaire(gestionnaireDTO);

        assertThat(savedGestionnaire)
                .extracting(GestionnaireDTO::getFirstName,
                            GestionnaireDTO::getLastName,
                            GestionnaireDTO::getEmail,
                            GestionnaireDTO::getPassword,
                            GestionnaireDTO::getPhone)
                .containsExactly("Doe", "John", "john.doe@example.com",
                                         "password", "123-456-7890");

        verify(gestionnaireRepository).existsByCredentialsEmail(gestionnaireDTO.getEmail());
        verify(gestionnaireRepository).save(any(Gestionnaire.class));
    }
}