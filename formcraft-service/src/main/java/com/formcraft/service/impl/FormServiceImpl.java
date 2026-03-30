package com.formcraft.service.impl;

import com.formcraft.dto.request.FormRequest;
import com.formcraft.dto.request.SubmissionRequest;
import com.formcraft.enums.FormStatus;
import com.formcraft.dto.response.FormDto;
import com.formcraft.dto.response.ResponseDto;
import com.formcraft.entity.Form;
import com.formcraft.entity.FormResponse;
import com.formcraft.exception.BusinessLogicException;
import com.formcraft.exception.ResourceNotFoundException;
import com.formcraft.mapper.FormMapper;
import com.formcraft.mapper.ResponseMapper;
import com.formcraft.repository.FormRepository;
import com.formcraft.repository.FormResponseRepository;
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

    private final FormRepository formRepository;
    private final FormResponseRepository formResponseRepository;
    private final FormMapper formMapper;
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

        // Security check: If form is inactive, only Admins/Super Admins can see it.
        boolean isAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (form.getStatus() != com.formcraft.enums.FormStatus.ACTIVE && !isAdmin) {
             throw new org.springframework.security.access.AccessDeniedException("Terminal Access Restricted: This form identity is currently offline.");
        }
        
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
    public Page<ResponseDto> getResponsesByFormId(UUID formId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
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
        
        if (form.getStatus() == FormStatus.ACTIVE) {
            form.setStatus(FormStatus.INACTIVE);
        } else {
            form.setStatus(FormStatus.ACTIVE);
        }
        
        Form savedForm = formRepository.save(form);
        return formMapper.toDto(savedForm);
    }

    @Override
    @Transactional
    public FormDto scheduleFormDeactivation(UUID id, int days) {
        Form form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + id));
        
        form.setExpiresAt(LocalDateTime.now().plusDays(days));
        Form savedForm = formRepository.save(form);
        return formMapper.toDto(savedForm);
    }
    @Override
    @Transactional
    public void deleteResponse(UUID responseId) {
        if (!formResponseRepository.existsById(responseId)) {
            throw new ResourceNotFoundException("Response not found with id: " + responseId);
        }
        formResponseRepository.deleteById(responseId);
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
        return responseMapper.toDto(updatedResponse);
    }

    @Override
    @Transactional
    public void deleteForm(UUID id) {
        if (!formRepository.existsById(id)) {
            throw new ResourceNotFoundException("Form not found with id: " + id);
        }
        formRepository.deleteById(id);
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
                throw new BusinessLogicException("Expiration date must be after the start date.");
            }
        }
    }
}
