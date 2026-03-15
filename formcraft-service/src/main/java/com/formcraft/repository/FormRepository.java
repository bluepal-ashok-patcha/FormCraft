package com.formcraft.repository;

import com.formcraft.entity.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FormRepository extends JpaRepository<Form, UUID> {
    java.util.Optional<Form> findBySlug(String slug);
    long countByCreatedBy(String username);
    long countByCreatedByAndActiveTrue(String username);
    java.util.List<Form> findTop5ByCreatedByOrderByCreatedAtDesc(String username);
}
