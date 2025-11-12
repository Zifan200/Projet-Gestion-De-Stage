package org.example.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.example.model.Etudiant;
import org.example.model.Teacher;
import org.example.repository.EtudiantRepository;
import org.example.repository.TeacherRepository;
import org.example.service.dto.student.EtudiantDTO;
import org.example.service.dto.teacher.TeacherDTO;
import org.example.service.exception.DuplicateUserException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherService {

    private static final Logger logger = LoggerFactory.getLogger(
        TeacherService.class
    );
    private final TeacherRepository teacherRepository;
    private final EtudiantRepository etudiantRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public TeacherService(
        TeacherRepository teacherRepository,
        EtudiantRepository etudiantRepository,
        PasswordEncoder passwordEncoder,
        NotificationService notificationService
    ) {
        this.teacherRepository = teacherRepository;
        this.etudiantRepository = etudiantRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @Transactional
    public TeacherDTO saveTeacher(TeacherDTO teacherDTO) {
        if (teacherRepository.existsByCredentialsEmail(teacherDTO.getEmail())) {
            throw new DuplicateUserException(
                "Le courriel " + teacherDTO.getEmail() + " est déjà utilisé."
            );
        }

        Teacher newTeacher = Teacher.builder()
            .firstName(teacherDTO.getFirstName())
            .lastName(teacherDTO.getLastName())
            .email(teacherDTO.getEmail())
            .password(passwordEncoder.encode(teacherDTO.getPassword()))
            .phone(teacherDTO.getPhone())
            .department(teacherDTO.getDepartment())
            .specialization(teacherDTO.getSpecialization())
            .since(
                teacherDTO.getSince() != null
                    ? teacherDTO.getSince()
                    : LocalDate.now()
            )
            .build();

        Teacher teacherSaved = teacherRepository.save(newTeacher);
        logger.info("Teacher created = {}", teacherSaved.getEmail());

        return TeacherDTO.fromEntity(teacherSaved);
    }

    @Transactional(readOnly = true)
    public List<TeacherDTO> getAllTeachers() {
        return teacherRepository
            .findAll()
            .stream()
            .map(TeacherDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeacherDTO getTeacherById(Long id) {
        Teacher teacher = teacherRepository
            .findById(id)
            .orElseThrow(() ->
                new RuntimeException("Teacher not found with id: " + id)
            );
        return TeacherDTO.fromEntity(teacher);
    }

    @Transactional(readOnly = true)
    public TeacherDTO getTeacherByEmail(String email) {
        Teacher teacher = teacherRepository
            .findByCredentialsEmail(email)
            .orElseThrow(() ->
                new RuntimeException("Teacher not found with email: " + email)
            );
        return TeacherDTO.fromEntity(teacher);
    }

    @Transactional(readOnly = true)
    public List<TeacherDTO> getTeachersByDepartment(String department) {
        return teacherRepository
            .findByDepartment(department)
            .stream()
            .map(TeacherDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public void assignStudentToTeacher(Long teacherId, Long etudiantId) {
        Teacher teacher = teacherRepository
            .findById(teacherId)
            .orElseThrow(() ->
                new RuntimeException("Teacher not found with id: " + teacherId)
            );

        Etudiant etudiant = etudiantRepository
            .findById(etudiantId)
            .orElseThrow(() ->
                new RuntimeException("Student not found with id: " + etudiantId)
            );

        // Vérifier si l'étudiant avait déjà un enseignant
        Teacher oldTeacher = etudiant.getTeacher();

        // Assigner le nouvel enseignant
        etudiant.setTeacher(teacher);
        etudiantRepository.save(etudiant);

        logger.info(
            "Student {} assigned to teacher {}",
            etudiant.getEmail(),
            teacher.getEmail()
        );

        // Envoyer les notifications
        notificationService.notifyTeacher(
            teacher,
            "Nouvel étudiant assigné",
            "L'étudiant " +
                etudiant.getFirstName() +
                " " +
                etudiant.getLastName() +
                " vous a été assigné pour le suivi de stage."
        );

        notificationService.notifyEtudiant(
            etudiant,
            "Professeur assigné",
            "Le professeur " +
                teacher.getFirstName() +
                " " +
                teacher.getLastName() +
                " a été assigné pour le suivi de votre stage."
        );

        // Notifier l'ancien enseignant si nécessaire
        if (oldTeacher != null && !oldTeacher.getId().equals(teacherId)) {
            notificationService.notifyTeacher(
                oldTeacher,
                "Étudiant réassigné",
                "L'étudiant " +
                    etudiant.getFirstName() +
                    " " +
                    etudiant.getLastName() +
                    " a été réassigné à un autre professeur."
            );
        }
    }

    @Transactional
    public void unassignStudentFromTeacher(Long etudiantId) {
        Etudiant etudiant = etudiantRepository
            .findById(etudiantId)
            .orElseThrow(() ->
                new RuntimeException("Student not found with id: " + etudiantId)
            );

        etudiant.setTeacher(null);
        etudiantRepository.save(etudiant);

        logger.info("Student {} unassigned from teacher", etudiant.getEmail());
    }

    @Transactional(readOnly = true)
    public List<EtudiantDTO> getMyStudents(String teacherEmail) {
        Teacher teacher = teacherRepository
            .findByCredentialsEmail(teacherEmail)
            .orElseThrow(() ->
                new RuntimeException(
                    "Teacher not found with email: " + teacherEmail
                )
            );

        return teacher
            .getStudents()
            .stream()
            .map(EtudiantDTO::fromEntity)
            .collect(Collectors.toList());
    }
}
