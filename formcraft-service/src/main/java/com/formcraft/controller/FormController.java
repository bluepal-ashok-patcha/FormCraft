package com.formcraft.controller;

import com.formcraft.dto.request.FormRequest;
import com.formcraft.dto.request.SubmissionRequest;
import com.formcraft.dto.response.ApiResponse;
import com.formcraft.dto.response.FormDto;
import com.formcraft.dto.response.ResponseDto;
import com.formcraft.service.FormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormService formService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<FormDto>> createForm(@Valid @RequestBody FormRequest request) {
        FormDto createdForm = formService.createForm(request);
        return new ResponseEntity<>(ApiResponse.success(createdForm, "Form created successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FormDto>> getFormById(@PathVariable("id") UUID id) {
        FormDto form = formService.getFormById(id);
        return ResponseEntity.ok(ApiResponse.success(form, "Form fetched successfully"));
    }

    @GetMapping("/s/{slug}")
    public ResponseEntity<ApiResponse<FormDto>> getFormBySlug(@PathVariable("slug") String slug) {
        FormDto form = formService.getFormBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(form, "Form fetched successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FormDto>>> getAllForms(Pageable pageable) {
        Page<FormDto> forms = formService.getAllForms(pageable);
        return ResponseEntity.ok(ApiResponse.success(forms, "All forms fetched successfully"));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<ResponseDto>> submitResponse(@Valid @RequestBody SubmissionRequest request) {
        ResponseDto response = formService.submitResponse(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Response submitted successfully"), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/responses")
    public ResponseEntity<ApiResponse<Page<ResponseDto>>> getResponses(@PathVariable("id") UUID id, Pageable pageable) {
        Page<ResponseDto> responses = formService.getResponsesByFormId(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(responses, "Responses fetched successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<FormDto>> toggleStatus(@PathVariable("id") UUID id) {
        FormDto updatedForm = formService.toggleFormStatus(id);
        String status = updatedForm.isActive() ? "Activated" : "Deactivated";
        return ResponseEntity.ok(ApiResponse.success(updatedForm, "Form " + status + " successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<FormDto>> scheduleDeactivation(@PathVariable("id") UUID id, @RequestParam("days") int days) {
        FormDto updatedForm = formService.scheduleFormDeactivation(id, days);
        return ResponseEntity.ok(ApiResponse.success(updatedForm, "Form scheduled for deactivation in " + days + " days"));
    }
}
