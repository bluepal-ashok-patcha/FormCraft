package com.formcraft.repository;

import com.formcraft.entity.FormResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Repository
public interface FormResponseRepository extends JpaRepository<FormResponse, UUID> {
    Page<FormResponse> findByFormId(UUID formId, Pageable pageable);
    long countByFormId(UUID formId);
    long countByFormCreatedBy(String username);
    java.util.List<FormResponse> findTop5ByFormCreatedByOrderByCreatedAtDesc(String username);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT fr.form.id) FROM FormResponse fr WHERE fr.form.createdBy = :username")
    long countActiveFormsByCreatedBy(@Param("username") String username);

    @org.springframework.data.jpa.repository.Query("SELECT CAST(fr.createdAt AS date) as date, COUNT(fr) as count FROM FormResponse fr WHERE fr.form.createdBy = :username AND fr.createdAt >= :startDate GROUP BY CAST(fr.createdAt AS date) ORDER BY CAST(fr.createdAt AS date) ASC")
    java.util.List<Object[]> findResponseStatsByCreatedBy(@Param("username") String username, @Param("startDate") java.time.LocalDateTime startDate);

    long countByFormCreatedByAndCreatedAtGreaterThanEqual(String username, java.time.LocalDateTime startDate);
}
