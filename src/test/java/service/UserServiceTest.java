package service;

import org.example.model.Etudiant;
import org.example.repository.EtudiantRepository;
import org.example.service.UserService;
import org.example.service.dto.EtudiantDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private EtudiantRepository etudiantRepository;
    private UserService userService;
    private EtudiantDTO dto;

    @BeforeEach
    void setUp() {
        etudiantRepository = mock(EtudiantRepository.class);
        userService = new UserService(etudiantRepository);

        dto = new EtudiantDTO();
        dto.setId(1L);
        dto.setPrenom("Woof");
        dto.setNom("Miaou");
        dto.setCourriel("nouveau@mail.com");
        dto.setTelephone("1234567890");
        dto.setAdresse("123 Rue Exemple");
        dto.setMotDePasse("Password123!");

        when(etudiantRepository.existsByCourriel(anyString())).thenReturn(false);
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(i -> i.getArgument(0));
    }

    private Etudiant getSavedEtudiant() {
        ArgumentCaptor<Etudiant> captor = ArgumentCaptor.forClass(Etudiant.class);
        verify(etudiantRepository).save(captor.capture());
        return captor.getValue();
    }

    @Test
    void inscriptionEtudiant_emailDejaUtilise() {
        EtudiantDTO dtoTest = new EtudiantDTO();
        dtoTest.setCourriel("test@mail.com");

        when(etudiantRepository.existsByCourriel("test@mail.com")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.inscriptionEtudiant(dtoTest);
        });

        assertEquals("Email already in use", exception.getMessage());
    }

    @Test
    void inscriptionEtudiant_Verification_champs() {
        userService.inscriptionEtudiant(dto);
        Etudiant saved = getSavedEtudiant();

        assertEquals("Woof", saved.getPrenom());
        assertEquals("Miaou", saved.getNom());
        assertEquals("nouveau@mail.com", saved.getCourriel());
        assertEquals("1234567890", saved.getTelephone());
        assertEquals("123 Rue Exemple", saved.getAdresse());

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertTrue(encoder.matches("Password123!", saved.getMotDePasse()));
    }

    @Test
    void inscriptionEtudiant_Verification_motDePasse_regles() {
        String mdp = dto.getMotDePasse();

        assertTrue(mdp.matches(".*[A-Z].*"), "Doit contenir au moins une majuscule");
        assertTrue(mdp.matches(".*[a-z].*"), "Doit contenir au moins une minuscule");
        assertTrue(mdp.matches(".*\\d.*"), "Doit contenir au moins un chiffre");
        assertTrue(mdp.matches(".*[!@#$%^&*()].*"), "Doit contenir au moins un caractère spécial");
    }

    @Test
    void inscriptionEtudiant_Verification_hashMotDePasse() {
        userService.inscriptionEtudiant(dto);
        Etudiant saved = getSavedEtudiant();

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertTrue(encoder.matches("Password123!", saved.getMotDePasse()));
    }

    @Test
    void inscriptionEtudiant_Succes_utilisateurCreeCorrectement() {
        when(etudiantRepository.existsByCourriel("nouveau@mail.com")).thenReturn(false);
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(i -> i.getArgument(0));

        EtudiantDTO savedDto = userService.inscriptionEtudiant(dto);

        assertNotNull(savedDto);
        assertEquals("nouveau@mail.com", savedDto.getCourriel());
        assertEquals("Miaou", savedDto.getNom());
        assertEquals("Woof", savedDto.getPrenom());
        assertEquals("1234567890", savedDto.getTelephone());
        assertEquals("123 Rue Exemple", savedDto.getAdresse());

        ArgumentCaptor<Etudiant> captor = ArgumentCaptor.forClass(Etudiant.class);
        verify(etudiantRepository).save(captor.capture());
        Etudiant savedEtudiant = captor.getValue();

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertTrue(encoder.matches("Password123!", savedEtudiant.getMotDePasse()));
    }


}
