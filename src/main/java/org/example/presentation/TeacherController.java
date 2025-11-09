package org.example.presentation;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.service.TeacherService;
import org.example.service.UserAppService;
import org.example.service.dto.student.EtudiantDTO;
import org.example.service.dto.teacher.TeacherDTO;
import org.example.utils.JwtTokenUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/teacher")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TeacherController {

    private static final Logger logger = LoggerFactory.getLogger(
        TeacherController.class
    );
    private final TeacherService teacherService;
    private final UserAppService userAppService;

    @PostMapping("/register")
    public ResponseEntity<TeacherDTO> createTeacher(
        @Valid @RequestBody TeacherDTO teacherDTO
    ) {
        logger.info("Création d'un enseignant: {}", teacherDTO.getEmail());
        TeacherDTO savedTeacher = teacherService.saveTeacher(teacherDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTeacher);
    }

    @GetMapping
    public ResponseEntity<List<TeacherDTO>> getAllTeachers() {
        logger.info("Récupération de tous les enseignants");
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherDTO> getTeacherById(@PathVariable Long id) {
        logger.info("Récupération de l'enseignant avec l'id: {}", id);
        return ResponseEntity.ok(teacherService.getTeacherById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<TeacherDTO> getTeacherByEmail(
        @PathVariable String email
    ) {
        logger.info("Récupération de l'enseignant avec l'email: {}", email);
        return ResponseEntity.ok(teacherService.getTeacherByEmail(email));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<TeacherDTO>> getTeachersByDepartment(
        @PathVariable String department
    ) {
        logger.info(
            "Récupération des enseignants du département: {}",
            department
        );
        return ResponseEntity.ok(
            teacherService.getTeachersByDepartment(department)
        );
    }

    @GetMapping("/my-students")
    public ResponseEntity<List<EtudiantDTO>> getMyStudents(
        HttpServletRequest request
    ) {
        String teacherEmail = userAppService
            .getMe(JwtTokenUtils.getTokenFromRequest(request))
            .getEmail();
        List<EtudiantDTO> students = teacherService.getMyStudents(teacherEmail);
        return ResponseEntity.ok(students);
    }
}
