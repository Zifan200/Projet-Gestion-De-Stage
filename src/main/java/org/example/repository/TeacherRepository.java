package org.example.repository;

import java.util.List;
import java.util.Optional;
import org.example.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    boolean existsByCredentialsEmail(String email);
    Optional<Teacher> findByCredentialsEmail(String email);
    List<Teacher> findByDepartment(String department);
    List<Teacher> findBySpecialization(String specialization);
}
