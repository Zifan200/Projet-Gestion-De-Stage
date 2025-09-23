package service;

import org.example.model.Etudiant;
import org.example.repository.EtudiantRepository;
import org.example.service.StudentService;
import org.example.service.dto.EtudiantDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private EtudiantRepository etudiantRepository;
    private StudentService studentService;
    private EtudiantDTO dto;

    @BeforeEach
    void setUp() {
        etudiantRepository = mock(EtudiantRepository.class);
        studentService = new StudentService(etudiantRepository);

        dto = EtudiantDTO
                .builder()
                .id(1L)
                .firstName("Woof")
                .lastName("Miaou")
                .email("nouveau@mail.com")
                .phone("1234567890")
                .adresse("123 Rue Exemple")
                .password("Password123!")
                .build();


        when(etudiantRepository.existsByCredentialsEmail(anyString())).thenReturn(false);
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(i -> i.getArgument(0));
    }

    private Etudiant getSavedEtudiant() {
        ArgumentCaptor<Etudiant> captor = ArgumentCaptor.forClass(Etudiant.class);
        verify(etudiantRepository).save(captor.capture());
        return captor.getValue();
    }

    @Test
    void inscriptionEtudiant_emailDejaUtilise() {
        EtudiantDTO dtoTest = EtudiantDTO
                .builder()
                .email("test@mail.com")
                .build();

        when(etudiantRepository.existsByCredentialsEmail("test@mail.com")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            studentService.inscriptionEtudiant(dtoTest);
        });

        assertEquals("Email already in use", exception.getMessage());
    }

    @Test
    void inscriptionEtudiant_Verification_champs() {
        studentService.inscriptionEtudiant(dto);
        Etudiant saved = getSavedEtudiant();

        assertEquals("Woof", saved.getFirstName());
        assertEquals("Miaou", saved.getLastName());
        assertEquals("nouveau@mail.com", saved.getEmail());
        assertEquals("1234567890", saved.getPhone());
        assertEquals("123 Rue Exemple", saved.getAdresse());

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertTrue(encoder.matches("Password123!", saved.getPassword()));
    }

    @Test
    void inscriptionEtudiant_Verification_motDePasse_regles() {
        String mdp = dto.getPassword();

        assertTrue(mdp.matches(".*[A-Z].*"), "Doit contenir au moins une majuscule");
        assertTrue(mdp.matches(".*[a-z].*"), "Doit contenir au moins une minuscule");
        assertTrue(mdp.matches(".*\\d.*"), "Doit contenir au moins un chiffre");
        assertTrue(mdp.matches(".*[!@#$%^&*()].*"), "Doit contenir au moins un caractère spécial");
    }

    @Test
    void inscriptionEtudiant_Verification_hashMotDePasse() {
        studentService.inscriptionEtudiant(dto);
        Etudiant saved = getSavedEtudiant();

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertTrue(encoder.matches("Password123!", saved.getPassword()));
    }

    @Test
    void inscriptionEtudiant_Succes_utilisateurCreeCorrectement() {
        when(etudiantRepository.existsByCredentialsEmail("nouveau@mail.com")).thenReturn(false);
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(i -> i.getArgument(0));

        EtudiantDTO savedDto = studentService.inscriptionEtudiant(dto);

        assertNotNull(savedDto);
        assertEquals("nouveau@mail.com", savedDto.getEmail());
        assertEquals("Miaou", savedDto.getLastName());
        assertEquals("Woof", savedDto.getFirstName());
        assertEquals("1234567890", savedDto.getPhone());
        assertEquals("123 Rue Exemple", savedDto.getAdresse());

        ArgumentCaptor<Etudiant> captor = ArgumentCaptor.forClass(Etudiant.class);
        verify(etudiantRepository).save(captor.capture());
        Etudiant savedEtudiant = captor.getValue();

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertTrue(encoder.matches("Password123!", savedEtudiant.getPassword()));
    }


}
