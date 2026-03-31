package com.formcraft.repository;

import com.formcraft.entity.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FormRepository extends JpaRepository<Form, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Form> {
    java.util.Optional<Form> findBySlug(String slug);
    long countByCreatedBy(String username);
    long countByCreatedByAndStatus(String username, com.formcraft.enums.FormStatus status);
    java.util.List<Form> findTop5ByCreatedByOrderByCreatedAtDesc(String username);
    
    long countByStatus(com.formcraft.enums.FormStatus status);
    java.util.List<Form> findTop5ByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Form f SET f.status = 'INACTIVE' WHERE f.status = 'ACTIVE' AND f.expiresAt IS NOT NULL AND f.expiresAt < :now")
    int deactivateExpiredForms(@org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Form f SET f.status = 'ACTIVE' WHERE f.status = 'PLANNED' AND f.startsAt IS NOT NULL AND f.startsAt <= :now AND (f.expiresAt IS NULL OR f.expiresAt > :now)")
    int activateScheduledForms(@org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);

    long countByCreatedByAndExpiresAtBetween(String username, java.time.LocalDateTime start, java.time.LocalDateTime end);
    long countByExpiresAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    java.util.List<Form> findAllByCreatedByAndExpiresAtBetweenOrderByExpiresAtAsc(String username, java.time.LocalDateTime start, java.time.LocalDateTime end);
    java.util.List<Form> findAllByExpiresAtBetweenOrderByExpiresAtAsc(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
