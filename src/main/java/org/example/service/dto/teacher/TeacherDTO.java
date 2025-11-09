package org.example.service.dto.teacher;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.model.Teacher;
import org.example.model.auth.Role;
import org.example.service.dto.util.UserDTO;

@EqualsAndHashCode(callSuper = true)
@Data
public class TeacherDTO extends UserDTO {

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(
        regexp = "\\d{3}-\\d{3}-\\d{4}",
        message = "Le téléphone doit être au format 514-123-4567"
    )
    private String phone;

    private String department;
    private String specialization;
    private LocalDate since;
    private Integer numberOfStudents;

    @Builder
    public TeacherDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        String password,
        Role role,
        String phone,
        String department,
        String specialization,
        LocalDate since,
        Integer numberOfStudents
    ) {
        super(id, firstName, lastName, email, password, role);
        this.phone = phone;
        this.department = department;
        this.specialization = specialization;
        this.since = since;
        this.numberOfStudents = numberOfStudents;
    }

    public TeacherDTO() {}

    public static Teacher toEntity(TeacherDTO dto) {
        return Teacher.builder()
            .id(dto.getId())
            .firstName(dto.getFirstName())
            .lastName(dto.getLastName())
            .email(dto.getEmail())
            .password(dto.getPassword())
            .phone(dto.getPhone())
            .department(dto.getDepartment())
            .specialization(dto.getSpecialization())
            .since(dto.getSince())
            .build();
    }

    public static TeacherDTO fromEntity(Teacher teacher) {
        return TeacherDTO.builder()
            .id(teacher.getId())
            .firstName(teacher.getFirstName())
            .lastName(teacher.getLastName())
            .email(teacher.getEmail())
            .password(teacher.getPassword())
            .role(teacher.getRole())
            .phone(teacher.getPhone())
            .department(teacher.getDepartment())
            .specialization(teacher.getSpecialization())
            .since(teacher.getSince())
            .numberOfStudents(
                teacher.getStudents() != null ? teacher.getStudents().size() : 0
            )
            .build();
    }

    public static TeacherDTO empty() {
        return new TeacherDTO();
    }
}
