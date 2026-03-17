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
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public ResponseEntity<ApiResponse<Page<FormDto>>> getAllForms(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", required = false) com.formcraft.enums.FormStatus status,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @org.springframework.data.web.PageableDefault(sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        Page<FormDto> forms = formService.getAllForms(search, status, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(forms, "All forms fetched successfully"));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<ResponseDto>> submitResponse(@Valid @RequestBody SubmissionRequest request) {
        ResponseDto response = formService.submitResponse(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Response submitted successfully"), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/responses")
    public ResponseEntity<ApiResponse<Page<ResponseDto>>> getResponses(
            @PathVariable("id") UUID id,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        Page<ResponseDto> responses = formService.getResponsesByFormId(id, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(responses, "Responses fetched successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<FormDto>> toggleStatus(@PathVariable("id") UUID id) {
        FormDto updatedForm = formService.toggleFormStatus(id);
        String statusLabel = updatedForm.getStatus() == com.formcraft.enums.FormStatus.ACTIVE ? "Activated" : "Deactivated";
        return ResponseEntity.ok(ApiResponse.success(updatedForm, "Form " + statusLabel + " successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<FormDto>> scheduleDeactivation(@PathVariable("id") UUID id, @RequestParam(name = "days") int days) {
        FormDto updatedForm = formService.scheduleFormDeactivation(id, days);
        return ResponseEntity.ok(ApiResponse.success(updatedForm, "Form scheduled for deactivation in " + days + " days"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteForm(@PathVariable("id") UUID id) {
        formService.deleteForm(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Form and all its responses deleted successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FormDto>> updateForm(@PathVariable("id") UUID id, @Valid @RequestBody FormRequest request) {
        FormDto updatedForm = formService.updateForm(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedForm, "Form updated successfully"));
    }
}
