package org.example.repository;

import org.example.model.Convocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConvocationRepository extends JpaRepository<Convocation, Long> {
}
