package com.formcraft.service;

import com.formcraft.dto.request.FormRequest;
import com.formcraft.dto.request.SubmissionRequest;
import com.formcraft.dto.response.FormDto;
import com.formcraft.dto.response.ResponseDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

public interface FormService {
    FormDto createForm(FormRequest request);
    FormDto getFormById(UUID id);
    FormDto getFormBySlug(String slug);
    Page<FormDto> getAllForms(String search, com.formcraft.enums.FormStatus status, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, Pageable pageable);
    
    ResponseDto submitResponse(SubmissionRequest request);
    Page<ResponseDto> getResponsesByFormId(UUID formId, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, Pageable pageable);
    
    FormDto toggleFormStatus(UUID id);
    FormDto scheduleFormDeactivation(UUID id, int days);

    void deleteResponse(UUID responseId);
    ResponseDto updateResponse(UUID responseId, java.util.Map<String, Object> responses);
    
    void deleteForm(UUID id);
    FormDto updateForm(UUID id, FormRequest request);
}
