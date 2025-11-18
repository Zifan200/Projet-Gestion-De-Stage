package org.example.presentation;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.service.CVService;
import org.example.service.InternshipApplicationService;
import org.example.service.InternshipOfferService;
import org.example.service.StudentService;
import org.example.service.TeacherService;
import org.example.service.dto.cv.CvDownloadDTO;
import org.example.service.dto.cv.CvResponseDTO;
import org.example.service.dto.cv.CvStatusDTO;
import org.example.service.dto.internship.InternshipOfferListDto;
import org.example.service.dto.internshipApplication.InternshipApplicationResponseDTO;
import org.example.service.dto.student.EtudiantDTO;
import org.example.service.dto.teacher.StudentAssignmentDTO;
import org.example.service.dto.teacher.TeacherDTO;
import org.example.utils.JwtTokenUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/gs")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class GestionnaireController {

    private final CVService cvService;
    private final InternshipApplicationService internshipApplicationService;
    private final TeacherService teacherService;

    @GetMapping("/list")
    public ResponseEntity<List<CvResponseDTO>> listAllCvs() {
        return ResponseEntity.ok(cvService.listAllCvs());
    }

    @PutMapping("/{cvId}/status")
    public ResponseEntity<CvResponseDTO> updateCvStatus(
        @PathVariable Long cvId,
        @RequestBody CvStatusDTO request
    ) {
        CvResponseDTO response = cvService.updateCvStatus(
            cvId,
            request.getStatus(),
            request.getReason()
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{cvId}/approve")
    public ResponseEntity<CvResponseDTO> approveCv(@PathVariable Long cvId) {
        CvResponseDTO response = cvService.approveCv(cvId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{cvId}/reject")
    public ResponseEntity<CvResponseDTO> rejectCv(
        @PathVariable Long cvId,
        @RequestBody CvStatusDTO request
    ) {
        CvResponseDTO response = cvService.refuseCv(cvId, request.getReason());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{cvId}/download")
    public ResponseEntity<byte[]> downloadCv(@PathVariable Long cvId) {
        CvDownloadDTO dto = cvService.downloadCvById(cvId);

        return ResponseEntity.ok()
            .header(
                "Content-Disposition",
                "inline; filename=\"" + dto.getFileName() + "\""
            )
            .header("Content-Type", dto.getFileType())
            .body(dto.getData());
    }

    @GetMapping("/get-all/students/with-application")
    public ResponseEntity<List<EtudiantDTO>> getAllStudentsWithApplication() {
        return ResponseEntity.ok(
            internshipApplicationService.getAllStudentsWithApplication()
        );
    }

    @GetMapping("/get-all-internship-offers")
    public ResponseEntity<
        List<InternshipApplicationResponseDTO>
    > getAllInternshipApplication() {
        return ResponseEntity.ok(
            internshipApplicationService.getAllApplications()
        );
    }

    // Routes pour la gestion des enseignants et attribution des étudiants

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherDTO>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @GetMapping("/teachers/{id}")
    public ResponseEntity<TeacherDTO> getTeacherById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getTeacherById(id));
    }

    @PostMapping("/assign-student-to-teacher")
    public ResponseEntity<Void> assignStudentToTeacher(
        @Valid @RequestBody StudentAssignmentDTO assignmentDTO
    ) {
        teacherService.assignStudentToTeacher(
            assignmentDTO.getTeacherId(),
            assignmentDTO.getStudentId()
        );
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @DeleteMapping("/unassign-student/{studentId}")
    public ResponseEntity<Void> unassignStudentFromTeacher(
        @PathVariable Long studentId
    ) {
        teacherService.unassignStudentFromTeacher(studentId);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}