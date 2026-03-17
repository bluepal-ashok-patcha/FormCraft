package com.formcraft.repository;

import com.formcraft.entity.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TemplateRepository extends JpaRepository<Template, UUID> {
    
    @Query("SELECT t FROM Template t WHERE t.global = true OR t.createdBy = :createdBy")
    List<Template> findAllVisible(@Param("createdBy") String createdBy);
    
    List<Template> findByGlobalTrue();
}
