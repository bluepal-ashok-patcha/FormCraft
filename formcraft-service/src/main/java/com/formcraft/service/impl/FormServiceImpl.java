package com.formcraft.service.impl;

import com.formcraft.dto.request.FormRequest;
import com.formcraft.dto.request.SubmissionRequest;
import com.formcraft.enums.FormStatus;
import com.formcraft.dto.response.FormDto;
import com.formcraft.dto.response.ResponseDto;
import com.formcraft.entity.Form;
import com.formcraft.entity.FormResponse;
import com.formcraft.entity.builder.FormDraft;
import com.formcraft.exception.BusinessLogicException;
import com.formcraft.exception.ResourceNotFoundException;
import com.formcraft.mapper.FormMapper;
import com.formcraft.mapper.ResponseMapper;
import com.formcraft.repository.FormRepository;
import com.formcraft.repository.FormResponseRepository;
import com.formcraft.service.AuditService;
import com.formcraft.service.FormService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class FormServiceImpl implements FormService {

    private static final String FORM_NOT_FOUND_MSG = "Form not found with id: ";
    private static final String CREATED_AT_FIELD = "createdAt";

    private final com.formcraft.repository.builder.FormDraftRepository formDraftRepository;
    private final FormRepository formRepository;
    private final FormResponseRepository formResponseRepository;
    private final FormMapper formMapper;
    private final AuditService auditService;
    private final ResponseMapper responseMapper;
    private final com.formcraft.util.FormValidator formValidator;
    private final org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    @org.springframework.beans.factory.annotation.Value("${app.kafka.topic}")
    private String submissionTopic;

    @Override
    @Transactional
    public FormDto createForm(FormRequest request) {
        validateFormSchedule(request.getStartsAt(), request.getExpiresAt());
        Form form = formMapper.toEntity(request);
        // Auto-generate slug from name: "Contact Us" -> "contact-us"
        String slug = request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        form.setSlug(slug + "-" + UUID.randomUUID().toString().substring(0, 8)); // Add random suffix for uniqueness
        
        // Initialize status
        LocalDateTime now = LocalDateTime.now();
        if (form.getStartsAt() != null && form.getStartsAt().isAfter(now)) {
            form.setStatus(FormStatus.PLANNED);
        } else if (form.getExpiresAt() != null && form.getExpiresAt().isBefore(now)) {
            form.setStatus(FormStatus.INACTIVE);
        } else {
            form.setStatus(FormStatus.ACTIVE);
        }
        
        Form savedForm = formRepository.save(form);
        auditService.log("CREATE_FORM", "FORM", savedForm.getId(), "Form created: " + savedForm.getName());
        return formMapper.toDto(savedForm);
    }

    @Override
    @Transactional(readOnly = true)
    public FormDto getFormById(UUID id) {
        Form form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(FORM_NOT_FOUND_MSG + id));
        return formMapper.toDto(form);
    }

    @Override
    @Transactional(readOnly = true)
    public FormDto getFormBySlug(String slug) {
        Form form = formRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with slug: " + slug));

        return formMapper.toDto(form);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FormDto> getAllForms(String search, com.formcraft.enums.FormStatus status, LocalDateTime startDate, LocalDateTime endDate, String dateType, Pageable pageable) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        
        Specification<Form> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Security: Standard Admins only see their own. Super Admins see EVERYTHING.
            boolean isSuperAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            
            if (!isSuperAdmin) {
                predicates.add(cb.equal(root.get("createdBy"), username));
            }
            
            if (search != null && !search.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // High-Fidelity Timeline Filtering: Default to creation, but support expiration tracking
            String filterField = "expiring".equalsIgnoreCase(dateType) ? "expiresAt" : CREATED_AT_FIELD;
            
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get(filterField), startDate));
            }
            
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get(filterField), endDate));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return formRepository.findAll(spec, pageable)
                .map(form -> {
                    FormDto dto = formMapper.toDto(form);
                    dto.setResponseCount(formResponseRepository.countByFormId(form.getId()));
                    return dto;
                });
    }

    @Override
    public ResponseDto submitResponse(SubmissionRequest request) {
        Form form = formRepository.findById(request.getFormId())
                .orElseThrow(() -> new ResourceNotFoundException(FORM_NOT_FOUND_MSG + request.getFormId()));

        if (form.getStatus() != FormStatus.ACTIVE) {
            throw new BusinessLogicException("Submission failed: This form is currently not active.");
        }

        // 1. Sync Validate (Fail-Fast)
        formValidator.validate(form.getSchema(), request.getResponses());

        // 2. Async Produce (Push to Kafka)
        log.debug("Pushing submission for form '{}' to event stream: {}", form.getName(), submissionTopic);
        kafkaTemplate.send(submissionTopic, request.getFormId().toString(), request);
        
        // 3. Early Return (Submission Accepted Status)
        return ResponseDto.builder()
                .formId(request.getFormId())
                .responseData(request.getResponses())
                .submittedAt(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResponseDto> getResponsesByFormId(UUID formId, String search, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return formResponseRepository.searchByFormId(formId, search, startDate, endDate, pageable)
                    .map(responseMapper::toDto);
        }
        
        Specification<FormResponse> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("form").get("id"), formId));
            
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get(CREATED_AT_FIELD), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get(CREATED_AT_FIELD), endDate));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return formResponseRepository.findAll(spec, pageable)
                .map(responseMapper::toDto);
    }

    @Override
    @Transactional
    public FormDto toggleFormStatus(UUID id) {
        Form form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(FORM_NOT_FOUND_MSG + id));
        
        FormStatus newStatus = (form.getStatus() == FormStatus.ACTIVE) ? FormStatus.INACTIVE : FormStatus.ACTIVE;
        form.setStatus(newStatus);
        
        Form savedForm = formRepository.save(form);
        auditService.log("TOGGLE_FORM_STATUS", "FORM", id, "Form status updated to: " + newStatus);
        return formMapper.toDto(savedForm);
    }

    @Override
    @Transactional
    public FormDto scheduleFormDeactivation(UUID id, int days) {
        Form form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(FORM_NOT_FOUND_MSG + id));
        
        form.setExpiresAt(LocalDateTime.now().plusDays(days));
        Form savedForm = formRepository.save(form);
        auditService.log("SCHEDULE_DEACTIVATION", "FORM", id, "Form scheduled for deactivation in " + days + " days.");
        return formMapper.toDto(savedForm);
    }
    @Override
    @Transactional
    public void deleteResponse(UUID responseId) {
        if (!formResponseRepository.existsById(responseId)) {
            throw new ResourceNotFoundException("Response not found with id: " + responseId);
        }
        formResponseRepository.deleteById(responseId);
        auditService.log("DELETE_RESPONSE", "RESPONSE", responseId, "Response deleted.");
    }

    @Override
    @Transactional
    public ResponseDto updateResponse(UUID responseId, java.util.Map<String, Object> responses) {
        FormResponse response = formResponseRepository.findById(responseId)
                .orElseThrow(() -> new ResourceNotFoundException("Response not found with id: " + responseId));
        
        // Validate against form schema
        formValidator.validate(response.getForm().getSchema(), responses);
        
        response.setResponseData(responses);
        FormResponse updatedResponse = formResponseRepository.save(response);
        auditService.log("UPDATE_RESPONSE", "RESPONSE", responseId, "Response updated.");
        return responseMapper.toDto(updatedResponse);
    }

    @Override
    @Transactional
    public void deleteForm(UUID id) {
        if (!formRepository.existsById(id)) {
            throw new ResourceNotFoundException(FORM_NOT_FOUND_MSG + id);
        }
        log.warn("Form Purge Protocol: Permanently decommissioning form ID '{}'", id);
        formRepository.deleteById(id);
        auditService.log("DELETE_FORM", "FORM", id, "Form deleted permanently.");
        log.info("Decommissioning Complete: Form ID '{}' erased from global index.", id);
    }

    @Override
    @Transactional
    public FormDto updateForm(UUID id, FormRequest request) {
        Form form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(FORM_NOT_FOUND_MSG + id));
        
        // Only validate schedule if it's actually changing. 
        // This prevents the "Start date cannot be in the past" error when extending already active forms.
        boolean startChanged = (form.getStartsAt() == null && request.getStartsAt() != null) || 
                              (form.getStartsAt() != null && !form.getStartsAt().equals(request.getStartsAt()));
        boolean endChanged = (form.getExpiresAt() == null && request.getExpiresAt() != null) || 
                            (form.getExpiresAt() != null && !form.getExpiresAt().equals(request.getExpiresAt()));

        if (startChanged || endChanged) {
            validateFormScheduleForUpdate(form, request.getStartsAt(), request.getExpiresAt());
        }
        
        form.setName(request.getName());
        form.setSchema(request.getSchema());
        form.setStartsAt(request.getStartsAt());
        form.setExpiresAt(request.getExpiresAt());
        form.setBannerUrl(request.getBannerUrl());
        form.setThemeColor(request.getThemeColor());
        
        // Re-calculate status
        LocalDateTime now = LocalDateTime.now();
        if (form.getStartsAt() != null && form.getStartsAt().isAfter(now)) {
            form.setStatus(FormStatus.PLANNED);
        } else if (form.getExpiresAt() != null && form.getExpiresAt().isBefore(now)) {
            form.setStatus(FormStatus.INACTIVE);
        } else {
            form.setStatus(FormStatus.ACTIVE);
        }
        
        Form updatedForm = formRepository.save(form);
        auditService.log("UPDATE_FORM", "FORM", id, "Form updated: " + updatedForm.getName());
        return formMapper.toDto(updatedForm);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportResponsesToCsv(UUID formId, String search, LocalDateTime startDate, LocalDateTime endDate) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found"));

        List<FormResponse> responses = formResponseRepository.searchByFormIdBulk(formId, search, startDate, endDate);
        List<java.util.Map<String, Object>> fields = (List<java.util.Map<String, Object>>) form.getSchema().get("fields");

        // Calculate Analytics Summary for inclusion via Internal Private Method (Sonar Proxy Compliance)
        java.util.Map<String, Object> analytics = calculateInternalAnalytics(form, responses);

        return com.formcraft.util.CsvHelper.responsesToCsv(responses, fields, analytics);
    }

    private void validateFormScheduleForUpdate(Form existingForm, LocalDateTime startsAt, LocalDateTime expiresAt) {
        LocalDateTime now = LocalDateTime.now().minusMinutes(5);
        
        // ONLY block past Start Date if the user is actually CHANGING it to something new.
        // If it's the same as what's already in the DB, it's allowed even if it's currently past.
        boolean isNewStart = (existingForm.getStartsAt() == null && startsAt != null) || 
                            (existingForm.getStartsAt() != null && !existingForm.getStartsAt().equals(startsAt));
                           
        if (isNewStart && startsAt != null && startsAt.isBefore(now)) {
            throw new BusinessLogicException("Start date cannot be in the past.");
        }
        
        if (expiresAt != null) {
            if (expiresAt.isBefore(LocalDateTime.now())) {
                throw new BusinessLogicException("Expiration date cannot be in the past.");
            }
            if (startsAt != null && expiresAt.isBefore(startsAt)) {
                throw new BusinessLogicException("Expiration date must be after the start date.");
            }
        }
    }

    private void validateFormSchedule(LocalDateTime startsAt, LocalDateTime expiresAt) {
        LocalDateTime now = LocalDateTime.now().minusMinutes(5); // 5 min grace for clock drift
        
        if (startsAt != null && startsAt.isBefore(now)) {
            throw new BusinessLogicException("Start date cannot be in the past.");
        }
        
        if (expiresAt != null) {
            if (expiresAt.isBefore(LocalDateTime.now())) {
                throw new BusinessLogicException("Expiration date cannot be in the past.");
            }
            if (startsAt != null && expiresAt.isBefore(startsAt)) {
                log.error("Validation Failure: Expiration date ({}) precedes Start date ({})", expiresAt, startsAt);
                throw new BusinessLogicException("Expiration date must be after the start date.");
            }
        }
    }

    @Override
    @Transactional
    public java.util.UUID saveDraft(UUID draftId, UUID formId, FormRequest request) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        FormDraft draft = null;
        
        // 1. Try to find by draftId first (Session Restoration)
        if (draftId != null) {
            draft = formDraftRepository.findById(draftId).orElse(null);
        }
        
        // 2. If nothing found, but we are editing an existing form, check by formId
        if (draft == null && formId != null) {
            draft = formDraftRepository.findByCreatedByAndFormId(username, formId).orElse(null);
        }

        // 3. Last fallback: Create a new draft session (don't clobber others)
        if (draft == null) {
            draft = FormDraft.builder()
                    .createdBy(username)
                    .formId(formId)
                    .build();
        }

        draft.setName(request.getName());
        draft.setSchema(request.getSchema());
        draft.setStartsAt(request.getStartsAt());
        draft.setExpiresAt(request.getExpiresAt());
        draft.setBannerUrl(request.getBannerUrl());
        draft.setThemeColor(request.getThemeColor());
        
        FormDraft savedDraft = formDraftRepository.save(draft);
        log.debug("Draft Lifecycle: Session saved with ID '{}' for form: {}", savedDraft.getId(), formId);
        return savedDraft.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public com.formcraft.dto.response.FormDraftDto getDraft(UUID formId) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        FormDraft draft = null;
        
        if (formId != null) {
            draft = formDraftRepository.findByCreatedByAndFormId(username, formId).orElse(null);
        } else {
            // Finding the LATEST draft for new forms
            draft = formDraftRepository.findAllByCreatedBy(username).stream()
                    .filter(d -> d.getFormId() == null)
                    .max(java.util.Comparator.comparing(FormDraft::getUpdatedAt))
                    .orElse(null);
        }

        if (draft == null) return null;

        return com.formcraft.dto.response.FormDraftDto.builder()
                .id(draft.getId())
                .formId(draft.getFormId())
                .name(draft.getName())
                .schema(draft.getSchema())
                .startsAt(draft.getStartsAt())
                .expiresAt(draft.getExpiresAt())
                .bannerUrl(draft.getBannerUrl())
                .themeColor(draft.getThemeColor())
                .updatedAt(draft.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<com.formcraft.dto.response.FormDraftDto> getAllDrafts() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return formDraftRepository.findAllByCreatedBy(username).stream()
                .map(draft -> com.formcraft.dto.response.FormDraftDto.builder()
                        .id(draft.getId())
                        .formId(draft.getFormId())
                        .name(draft.getName())
                        .schema(draft.getSchema())
                        .startsAt(draft.getStartsAt())
                        .expiresAt(draft.getExpiresAt())
                        .bannerUrl(draft.getBannerUrl())
                        .themeColor(draft.getThemeColor())
                        .updatedAt(draft.getUpdatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteDraft(UUID formId, UUID draftId) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        
        if (draftId != null) {
             formDraftRepository.findById(draftId).ifPresent(formDraftRepository::delete);
        } else if (formId != null) {
            formDraftRepository.findByCreatedByAndFormId(username, formId).ifPresent(formDraftRepository::delete);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getFormAnalytics(UUID formId) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException(FORM_NOT_FOUND_MSG + formId));

        java.util.List<com.formcraft.entity.FormResponse> responses = formResponseRepository.findAllByFormIdOrderByCreatedAtDesc(formId);
        return calculateInternalAnalytics(form, responses);
    }

    /**
     * Shared Internal Logic to handle statistical breakdown.
     * Bypasses the need for a secondary transactional proxy call.
     */
    @SuppressWarnings("unchecked")
    private java.util.Map<String, Object> calculateInternalAnalytics(Form form, java.util.List<com.formcraft.entity.FormResponse> responses) {
        java.util.Map<String, Object> analytics = new java.util.HashMap<>();
        
        java.util.List<java.util.Map<String, Object>> fields = (java.util.List<java.util.Map<String, Object>>) form.getSchema().get("fields");
        if (fields == null) return analytics;

        for (java.util.Map<String, Object> field : fields) {
            String type = (String) field.get("type");
            String fId = (String) field.get("id");
            String label = (String) field.get("label");

            if (isCategoricalType(type)) {
                java.util.Map<String, Integer> distribution = calculateFieldDistribution(responses, fId, label);
                
                if (!distribution.isEmpty()) {
                    analytics.put(fId, buildFieldStats(label, distribution, responses.size()));
                }
            }
        }
        
        return analytics;
    }

    private boolean isCategoricalType(String type) {
        return "dropdown".equalsIgnoreCase(type) || "radio".equalsIgnoreCase(type) || 
               "checkbox".equalsIgnoreCase(type) || "rating".equalsIgnoreCase(type) || 
               "linear-scale".equalsIgnoreCase(type);
    }

    private java.util.Map<String, Integer> calculateFieldDistribution(java.util.List<com.formcraft.entity.FormResponse> responses, String fId, String label) {
        java.util.Map<String, Integer> distribution = new java.util.HashMap<>();
        for (com.formcraft.entity.FormResponse response : responses) {
            Object value = response.getResponseData().get(fId);
            if (value == null) value = response.getResponseData().get(label);
            updateDistribution(distribution, value);
        }
        return distribution;
    }

    private void updateDistribution(java.util.Map<String, Integer> distribution, Object value) {
        if (value instanceof java.util.List) {
            for (Object v : (java.util.List<?>) value) {
                String s = String.valueOf(v);
                distribution.put(s, distribution.getOrDefault(s, 0) + 1);
            }
        } else if (value != null) {
            String s = String.valueOf(value);
            distribution.put(s, distribution.getOrDefault(s, 0) + 1);
        }
    }

    private java.util.Map<String, Object> buildFieldStats(String label, java.util.Map<String, Integer> distribution, int totalSize) {
        java.util.Map<String, Object> fieldStats = new java.util.HashMap<>();
        fieldStats.put("label", label);
        fieldStats.put("distribution", distribution);
        
        distribution.entrySet().stream()
                .max(java.util.Map.Entry.comparingByValue())
                .ifPresent(top -> {
                    fieldStats.put("topAnswer", top.getKey());
                    fieldStats.put("topCount", top.getValue());
                });
        
        fieldStats.put("totalResponses", totalSize);
        return fieldStats;
    }
}
