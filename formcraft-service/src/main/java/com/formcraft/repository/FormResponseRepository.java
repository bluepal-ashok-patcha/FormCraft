package com.formcraft.repository;

import com.formcraft.entity.FormResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Repository
public interface FormResponseRepository extends JpaRepository<FormResponse, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<FormResponse> {
    Page<FormResponse> findByFormId(UUID formId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM form_responses fr " +
            "WHERE fr.form_id = :formId " +
            "AND (CAST(fr.response_data AS text) ILIKE %:search% OR CAST(fr.id AS text) ILIKE %:search%) " +
            "AND (CAST(:startDate AS timestamp) IS NULL OR fr.created_at >= :startDate) " +
            "AND (CAST(:endDate AS timestamp) IS NULL OR fr.created_at <= :endDate)",
            nativeQuery = true)
    Page<FormResponse> searchByFormId(@Param("formId") UUID formId, @Param("search") String search, 
                                      @Param("startDate") java.time.LocalDateTime startDate, 
                                      @Param("endDate") java.time.LocalDateTime endDate, 
                                      Pageable pageable);

    java.util.List<FormResponse> findAllByFormIdOrderByCreatedAtDesc(UUID formId);
    long countByFormId(UUID formId);
    long countByFormCreatedBy(String username);
    java.util.List<FormResponse> findTop5ByFormCreatedByOrderByCreatedAtDesc(String username);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT fr.form.id) FROM FormResponse fr WHERE fr.form.createdBy = :username")
    long countActiveFormsByCreatedBy(@Param("username") String username);

    @org.springframework.data.jpa.repository.Query("SELECT CAST(fr.createdAt AS date) as date, COUNT(fr) as count FROM FormResponse fr WHERE fr.form.createdBy = :username AND fr.createdAt >= :startDate GROUP BY CAST(fr.createdAt AS date) ORDER BY CAST(fr.createdAt AS date) ASC")
    java.util.List<Object[]> findResponseStatsByCreatedBy(@Param("username") String username, @Param("startDate") java.time.LocalDateTime startDate);

    long countByFormCreatedByAndCreatedAtGreaterThanEqual(String username, java.time.LocalDateTime startDate);
    
    java.util.List<FormResponse> findTop5ByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT fr.form.id) FROM FormResponse fr")
    long countActiveForms();

    @org.springframework.data.jpa.repository.Query("SELECT CAST(fr.createdAt AS date) as date, COUNT(fr) as count FROM FormResponse fr WHERE fr.createdAt >= :startDate GROUP BY CAST(fr.createdAt AS date) ORDER BY CAST(fr.createdAt AS date) ASC")
    java.util.List<Object[]> findGlobalResponseStats(@Param("startDate") java.time.LocalDateTime startDate);

    long countByCreatedAtGreaterThanEqual(java.time.LocalDateTime startDate);
}
