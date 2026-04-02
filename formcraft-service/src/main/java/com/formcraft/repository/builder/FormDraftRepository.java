package com.formcraft.repository.builder;

import com.formcraft.entity.builder.FormDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FormDraftRepository extends JpaRepository<FormDraft, UUID> {
    java.util.List<FormDraft> findAllByCreatedBy(String createdBy);
    long countByCreatedBy(String createdBy);
    java.util.Optional<FormDraft> findByCreatedByAndFormId(String createdBy, UUID formId);
    java.util.Optional<FormDraft> findByCreatedByAndFormIdIsNull(String createdBy); // For new forms
}
