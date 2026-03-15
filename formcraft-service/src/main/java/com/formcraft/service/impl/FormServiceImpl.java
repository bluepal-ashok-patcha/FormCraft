package com.formcraft.service.impl;

import com.formcraft.dto.request.FormRequest;
import com.formcraft.dto.request.SubmissionRequest;
import com.formcraft.dto.response.FormDto;
import com.formcraft.dto.response.ResponseDto;
import com.formcraft.entity.Form;
import com.formcraft.entity.FormResponse;
import com.formcraft.exception.BadRequestException;
import com.formcraft.exception.ResourceNotFoundException;
import com.formcraft.mapper.FormMapper;
import com.formcraft.mapper.ResponseMapper;
import com.formcraft.repository.FormRepository;
import com.formcraft.repository.FormResponseRepository;
import com.formcraft.service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
        Form form = formMapper.toEntity(request);
        // Auto-generate slug from name: "Contact Us" -> "contact-us"
        String slug = request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        form.setSlug(slug + "-" + UUID.randomUUID().toString().substring(0, 8)); // Add random suffix for uniqueness
        
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
        
        return formMapper.toDto(form);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FormDto> getAllForms(Pageable pageable) {
        return formRepository.findAll(pageable)
                .map(form -> {
                    FormDto dto = formMapper.toDto(form);
                    dto.setResponseCount(formResponseRepository.countByFormId(form.getId()));
                    return dto;
                });
    }

    @Override
    @Transactional
    public ResponseDto submitResponse(SubmissionRequest request) {
        try {
            Form form = formRepository.findById(request.getFormId())
                    .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + request.getFormId()));

            if (!form.isActive()) {
                throw new BadRequestException("Submission failed: This form is currently inactive.");
            }

            if (form.getStartsAt() != null && form.getStartsAt().isAfter(LocalDateTime.now())) {
                throw new BadRequestException("Submission failed: This form is not active yet.");
            }

            if (form.getExpiresAt() != null && form.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Submission failed: This form has expired.");
            }

            // Validate submission against form schema
            formValidator.validate(form.getSchema(), request.getResponses());

            FormResponse response = FormResponse.builder()
                    .form(form)
                    .responseData(request.getResponses())
                    .build();

            System.out.println("DEBUG: Saving FormResponse for form: " + form.getName());
            FormResponse savedResponse = formResponseRepository.saveAndFlush(response);
            return responseMapper.toDto(savedResponse);
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in submitResponse: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ResponseDto> getResponsesByFormId(UUID formId, Pageable pageable) {
        return formResponseRepository.findByFormId(formId, pageable)
                .map(responseMapper::toDto);
    }

    @Override
    @Transactional
    public FormDto toggleFormStatus(UUID id) {
        Form form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + id));
        
        form.setActive(!form.isActive());
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
}
