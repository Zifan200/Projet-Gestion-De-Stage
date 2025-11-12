package org.example.service;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.example.model.Etudiant;
import org.example.model.Teacher;
import org.example.repository.EtudiantRepository;
import org.example.repository.TeacherRepository;
import org.example.service.dto.student.EtudiantDTO;
import org.example.service.dto.teacher.TeacherDTO;
import org.example.service.exception.DuplicateUserException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TeacherService teacherService;

    @Test
    void saveTeacher_shouldSaveTeacher() {
        // Arrange
        TeacherDTO teacherDTO = TeacherDTO.builder()
            .email("teacher@college.com")
            .firstName("Marie")
            .lastName("Tremblay")
            .password("password123")
            .phone("514-555-1234")
            .department("Informatique")
            .specialization("Développement logiciel")
            .since(LocalDate.of(2020, 9, 1))
            .build();

        when(
            teacherRepository.existsByCredentialsEmail(teacherDTO.getEmail())
        ).thenReturn(false);
        when(passwordEncoder.encode(teacherDTO.getPassword())).thenReturn(
            "encodedPassword123"
        );
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(
            invocation -> {
                Teacher teacher = invocation.getArgument(0);
                teacher.setId(1L);
                return teacher;
            }
        );

        // Act
        TeacherDTO savedTeacher = teacherService.saveTeacher(teacherDTO);

        // Assert
        assertThat(savedTeacher)
            .extracting(
                TeacherDTO::getEmail,
                TeacherDTO::getFirstName,
                TeacherDTO::getLastName,
                TeacherDTO::getDepartment,
                TeacherDTO::getSpecialization
            )
            .containsExactly(
                "teacher@college.com",
                "Marie",
                "Tremblay",
                "Informatique",
                "Développement logiciel"
            );
        verify(teacherRepository).existsByCredentialsEmail(
            "teacher@college.com"
        );
        verify(passwordEncoder).encode("password123");
        verify(teacherRepository).save(any(Teacher.class));
    }

    @Test
    void saveTeacher_shouldThrowExceptionWhenEmailExists() {
        // Arrange
        TeacherDTO teacherDTO = TeacherDTO.builder()
            .email("existing@college.com")
            .firstName("Jean")
            .lastName("Dupont")
            .password("password123")
            .phone("514-555-5678")
            .department("Informatique")
            .build();

        when(
            teacherRepository.existsByCredentialsEmail(teacherDTO.getEmail())
        ).thenReturn(true);

        // Act + Assert
        assertThatThrownBy(() -> teacherService.saveTeacher(teacherDTO))
            .isInstanceOf(DuplicateUserException.class)
            .hasMessageContaining(
                "Le courriel existing@college.com est déjà utilisé."
            );
        verify(teacherRepository).existsByCredentialsEmail(
            "existing@college.com"
        );
        verify(teacherRepository, never()).save(any(Teacher.class));
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void saveTeacher_shouldSetCurrentDateWhenSinceIsNull() {
        // Arrange
        TeacherDTO teacherDTO = TeacherDTO.builder()
            .email("teacher@college.com")
            .firstName("Marie")
            .lastName("Tremblay")
            .password("password123")
            .phone("514-555-1234")
            .department("Informatique")
            .since(null) // No date provided
            .build();

        when(
            teacherRepository.existsByCredentialsEmail(anyString())
        ).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(
            invocation -> invocation.getArgument(0)
        );

        // Act
        TeacherDTO savedTeacher = teacherService.saveTeacher(teacherDTO);

        // Assert
        assertNotNull(savedTeacher);
        verify(teacherRepository).save(any(Teacher.class));
    }

    @Test
    void getAllTeachers_shouldReturnAllTeachers() {
        // Arrange
        Teacher teacher1 = Teacher.builder()
            .id(1L)
            .firstName("Marie")
            .lastName("Tremblay")
            .email("marie@college.com")
            .phone("514-555-1234")
            .department("Informatique")
            .build();
        teacher1.setStudents(new ArrayList<>());

        Teacher teacher2 = Teacher.builder()
            .id(2L)
            .firstName("Jean")
            .lastName("Dupont")
            .email("jean@college.com")
            .phone("514-555-5678")
            .department("Mathématiques")
            .build();
        teacher2.setStudents(new ArrayList<>());

        when(teacherRepository.findAll()).thenReturn(
            List.of(teacher1, teacher2)
        );

        // Act
        List<TeacherDTO> teachers = teacherService.getAllTeachers();

        // Assert
        assertNotNull(teachers);
        assertEquals(2, teachers.size());
        assertEquals("marie@college.com", teachers.get(0).getEmail());
        assertEquals("jean@college.com", teachers.get(1).getEmail());
        verify(teacherRepository).findAll();
    }

    @Test
    void getTeacherById_shouldReturnTeacher() {
        // Arrange
        Teacher teacher = Teacher.builder()
            .id(1L)
            .firstName("Marie")
            .lastName("Tremblay")
            .email("marie@college.com")
            .phone("514-555-1234")
            .department("Informatique")
            .build();
        teacher.setStudents(new ArrayList<>());

        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        // Act
        TeacherDTO result = teacherService.getTeacherById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("marie@college.com", result.getEmail());
        assertEquals("Marie", result.getFirstName());
        assertEquals("Tremblay", result.getLastName());
        verify(teacherRepository).findById(1L);
    }

    @Test
    void getTeacherById_shouldThrowExceptionWhenNotFound() {
        // Arrange
        when(teacherRepository.findById(999L)).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() -> teacherService.getTeacherById(999L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Teacher not found with id: 999");
        verify(teacherRepository).findById(999L);
    }

    @Test
    void getTeacherByEmail_shouldReturnTeacher() {
        // Arrange
        Teacher teacher = Teacher.builder()
            .id(1L)
            .firstName("Marie")
            .lastName("Tremblay")
            .email("marie@college.com")
            .phone("514-555-1234")
            .department("Informatique")
            .build();
        teacher.setStudents(new ArrayList<>());

        when(
            teacherRepository.findByCredentialsEmail("marie@college.com")
        ).thenReturn(Optional.of(teacher));

        // Act
        TeacherDTO result = teacherService.getTeacherByEmail(
            "marie@college.com"
        );

        // Assert
        assertNotNull(result);
        assertEquals("marie@college.com", result.getEmail());
        assertEquals("Marie", result.getFirstName());
        verify(teacherRepository).findByCredentialsEmail("marie@college.com");
    }

    @Test
    void getTeacherByEmail_shouldThrowExceptionWhenNotFound() {
        // Arrange
        when(
            teacherRepository.findByCredentialsEmail("notfound@college.com")
        ).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() ->
            teacherService.getTeacherByEmail("notfound@college.com")
        )
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining(
                "Teacher not found with email: notfound@college.com"
            );
        verify(teacherRepository).findByCredentialsEmail(
            "notfound@college.com"
        );
    }

    @Test
    void getTeachersByDepartment_shouldReturnTeachersInDepartment() {
        // Arrange
        Teacher teacher1 = Teacher.builder()
            .id(1L)
            .firstName("Marie")
            .lastName("Tremblay")
            .email("marie@college.com")
            .department("Informatique")
            .build();
        teacher1.setStudents(new ArrayList<>());

        Teacher teacher2 = Teacher.builder()
            .id(2L)
            .firstName("Jean")
            .lastName("Dupont")
            .email("jean@college.com")
            .department("Informatique")
            .build();
        teacher2.setStudents(new ArrayList<>());

        when(teacherRepository.findByDepartment("Informatique")).thenReturn(
            List.of(teacher1, teacher2)
        );

        // Act
        List<TeacherDTO> teachers = teacherService.getTeachersByDepartment(
            "Informatique"
        );

        // Assert
        assertNotNull(teachers);
        assertEquals(2, teachers.size());
        assertEquals("marie@college.com", teachers.get(0).getEmail());
        assertEquals("jean@college.com", teachers.get(1).getEmail());
        verify(teacherRepository).findByDepartment("Informatique");
    }

    @Test
    void assignStudentToTeacher_shouldAssignSuccessfully() {
        // Arrange
        Teacher teacher = Teacher.builder()
            .id(1L)
            .firstName("Marie")
            .lastName("Tremblay")
            .email("marie@college.com")
            .build();
        teacher.setStudents(new ArrayList<>());

        Etudiant student = Etudiant.builder()
            .id(1L)
            .firstName("Pierre")
            .lastName("Martin")
            .email("pierre@student.com")
            .build();

        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(student));
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(
            invocation -> invocation.getArgument(0)
        );

        // Act
        teacherService.assignStudentToTeacher(1L, 1L);

        // Assert
        verify(teacherRepository).findById(1L);
        verify(etudiantRepository).findById(1L);
        verify(etudiantRepository).save(student);
        verify(notificationService).notifyTeacher(
            eq(teacher),
            eq("Nouvel étudiant assigné"),
            contains("Pierre Martin")
        );
        verify(notificationService).notifyEtudiant(
            eq(student),
            eq("Professeur assigné"),
            contains("Marie Tremblay")
        );
    }

    @Test
    void assignStudentToTeacher_shouldNotifyOldTeacher() {
        // Arrange
        Teacher oldTeacher = Teacher.builder()
            .id(1L)
            .firstName("Jean")
            .lastName("Dupont")
            .email("jean@college.com")
            .build();
        oldTeacher.setStudents(new ArrayList<>());

        Teacher newTeacher = Teacher.builder()
            .id(2L)
            .firstName("Marie")
            .lastName("Tremblay")
            .email("marie@college.com")
            .build();
        newTeacher.setStudents(new ArrayList<>());

        Etudiant student = Etudiant.builder()
            .id(1L)
            .firstName("Pierre")
            .lastName("Martin")
            .email("pierre@student.com")
            .build();
        student.setTeacher(oldTeacher);

        when(teacherRepository.findById(2L)).thenReturn(
            Optional.of(newTeacher)
        );
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(student));
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(
            invocation -> invocation.getArgument(0)
        );

        // Act
        teacherService.assignStudentToTeacher(2L, 1L);

        // Assert
        verify(notificationService).notifyTeacher(
            eq(newTeacher),
            eq("Nouvel étudiant assigné"),
            contains("Pierre Martin")
        );
        verify(notificationService).notifyEtudiant(
            eq(student),
            eq("Professeur assigné"),
            contains("Marie Tremblay")
        );
        verify(notificationService).notifyTeacher(
            eq(oldTeacher),
            eq("Étudiant réassigné"),
            contains("Pierre Martin")
        );
    }

    @Test
    void assignStudentToTeacher_shouldThrowExceptionWhenTeacherNotFound() {
        // Arrange
        when(teacherRepository.findById(999L)).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() ->
            teacherService.assignStudentToTeacher(999L, 1L)
        )
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Teacher not found with id: 999");
        verify(teacherRepository).findById(999L);
        verify(etudiantRepository, never()).findById(any());
        verify(notificationService, never()).notifyTeacher(any(), any(), any());
    }

    @Test
    void assignStudentToTeacher_shouldThrowExceptionWhenStudentNotFound() {
        // Arrange
        Teacher teacher = Teacher.builder()
            .id(1L)
            .firstName("Marie")
            .lastName("Tremblay")
            .email("marie@college.com")
            .build();
        teacher.setStudents(new ArrayList<>());

        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(etudiantRepository.findById(999L)).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() ->
            teacherService.assignStudentToTeacher(1L, 999L)
        )
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Student not found with id: 999");
        verify(teacherRepository).findById(1L);
        verify(etudiantRepository).findById(999L);
        verify(notificationService, never()).notifyTeacher(any(), any(), any());
    }

    @Test
    void unassignStudentFromTeacher_shouldUnassignSuccessfully() {
        // Arrange
        Teacher teacher = Teacher.builder()
            .id(1L)
            .firstName("Marie")
            .lastName("Tremblay")
            .email("marie@college.com")
            .build();

        Etudiant student = Etudiant.builder()
            .id(1L)
            .firstName("Pierre")
            .lastName("Martin")
            .email("pierre@student.com")
            .build();
        student.setTeacher(teacher);

        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(student));
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(
            invocation -> invocation.getArgument(0)
        );

        // Act
        teacherService.unassignStudentFromTeacher(1L);

        // Assert
        verify(etudiantRepository).findById(1L);
        verify(etudiantRepository).save(student);
    }

    @Test
    void unassignStudentFromTeacher_shouldThrowExceptionWhenStudentNotFound() {
        // Arrange
        when(etudiantRepository.findById(999L)).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() ->
            teacherService.unassignStudentFromTeacher(999L)
        )
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Student not found with id: 999");
        verify(etudiantRepository).findById(999L);
        verify(etudiantRepository, never()).save(any());
    }

    @Test
    void getMyStudents_shouldReturnTeacherStudents() {
        // Arrange
        Etudiant student1 = Etudiant.builder()
            .id(1L)
            .firstName("Pierre")
            .lastName("Martin")
            .email("pierre@student.com")
            .phone("514-555-1111")
            .program("Informatique")
            .build();
        student1.setApplications(new ArrayList<>());

        Etudiant student2 = Etudiant.builder()
            .id(2L)
            .firstName("Sophie")
            .lastName("Dubois")
            .email("sophie@student.com")
            .phone("514-555-2222")
            .program("Informatique")
            .build();
        student2.setApplications(new ArrayList<>());

        Teacher teacher = Teacher.builder()
            .id(1L)
            .firstName("Marie")
            .lastName("Tremblay")
            .email("marie@college.com")
            .build();
        teacher.setStudents(List.of(student1, student2));

        when(
            teacherRepository.findByCredentialsEmail("marie@college.com")
        ).thenReturn(Optional.of(teacher));

        // Act
        List<EtudiantDTO> students = teacherService.getMyStudents(
            "marie@college.com"
        );

        // Assert
        assertNotNull(students);
        assertEquals(2, students.size());
        assertEquals("pierre@student.com", students.get(0).getEmail());
        assertEquals("sophie@student.com", students.get(1).getEmail());
        verify(teacherRepository).findByCredentialsEmail("marie@college.com");
    }

    @Test
    void getMyStudents_shouldThrowExceptionWhenTeacherNotFound() {
        // Arrange
        when(
            teacherRepository.findByCredentialsEmail("notfound@college.com")
        ).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() ->
            teacherService.getMyStudents("notfound@college.com")
        )
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining(
                "Teacher not found with email: notfound@college.com"
            );
        verify(teacherRepository).findByCredentialsEmail(
            "notfound@college.com"
        );
    }

    @Test
    void getMyStudents_shouldReturnEmptyListWhenNoStudents() {
        // Arrange
        Teacher teacher = Teacher.builder()
            .id(1L)
            .firstName("Marie")
            .lastName("Tremblay")
            .email("marie@college.com")
            .build();
        teacher.setStudents(new ArrayList<>());

        when(
            teacherRepository.findByCredentialsEmail("marie@college.com")
        ).thenReturn(Optional.of(teacher));

        // Act
        List<EtudiantDTO> students = teacherService.getMyStudents(
            "marie@college.com"
        );

        // Assert
        assertNotNull(students);
        assertEquals(0, students.size());
        verify(teacherRepository).findByCredentialsEmail("marie@college.com");
    }
}
