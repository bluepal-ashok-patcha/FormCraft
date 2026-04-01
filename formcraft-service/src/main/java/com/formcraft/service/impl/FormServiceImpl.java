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

    private final com.formcraft.repository.builder.FormDraftRepository formDraftRepository;
    private final FormRepository formRepository;
    private final FormResponseRepository formResponseRepository;
    private final FormMapper formMapper;
    private final AuditService auditService;
    private final ResponseMapper responseMapper;
    private final com.formcraft.util.FormValidator formValidator;

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
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + id));
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
    public Page<FormDto> getAllForms(String search, FormStatus status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
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
            
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }
            
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
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
    @Transactional
    public ResponseDto submitResponse(SubmissionRequest request) {
        Form form = formRepository.findById(request.getFormId())
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + request.getFormId()));

        if (form.getStatus() != FormStatus.ACTIVE) {
            throw new BusinessLogicException("Submission failed: This form is currently not active.");
        }

        // Validate submission against form schema
        formValidator.validate(form.getSchema(), request.getResponses());

        FormResponse response = FormResponse.builder()
                .form(form)
                .responseData(request.getResponses())
                .build();

        FormResponse savedResponse = formResponseRepository.saveAndFlush(response);
        log.info("Transmission Indexed: New response recorded for form '{}'", form.getName());
        return responseMapper.toDto(savedResponse);
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
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
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
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + id));
        
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
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + id));
        
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
            throw new ResourceNotFoundException("Form not found with id: " + id);
        }
        log.warn("Form Purge Protocol: Permanently decommissioning form ID '{}'", id);
        formRepository.deleteById(id);
        auditService.log("DELETE_FORM", "FORM", id, "Form deleted permanently.");
        log.info("Decommissioning Complete: Form ID '{}' erased from global index.", id);
    }

    @Override
    @Transactional
    public FormDto updateForm(UUID id, FormRequest request) {
        validateFormSchedule(request.getStartsAt(), request.getExpiresAt());
        Form form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + id));
        
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
    public byte[] exportResponsesToCsv(UUID formId, LocalDateTime startDate, LocalDateTime endDate) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found"));

        Specification<FormResponse> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("form").get("id"), formId));
            
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }
            
            if (query != null) {
                query.orderBy(cb.desc(root.get("createdAt")));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<FormResponse> responses = formResponseRepository.findAll(spec);
        List<java.util.Map<String, Object>> fields = (List<java.util.Map<String, Object>>) form.getSchema().get("fields");

        return com.formcraft.util.CsvHelper.responsesToCsv(responses, fields);
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
}
