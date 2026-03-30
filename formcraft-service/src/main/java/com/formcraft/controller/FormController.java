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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
@Tag(name = "Forms", description = "Everything related to creating, viewing, and managing your forms.")
public class FormController {

    private final FormService formService;
    private final com.formcraft.service.CloudinaryService cloudinaryService;

    @Operation(summary = "Upload submission attachment", description = "Allow respondents to upload files that will be included with their form submission.")
    @PostMapping("/upload-attachment")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> uploadAttachment(@Parameter(description = "The file you want to upload") @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String url = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(ApiResponse.success(java.util.Map.of("url", url), "Submission attachment successfully synchronized."));
    }

    @Operation(summary = "Create a new form", description = "Build a new form by providing its name, fields, and settings.")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<FormDto>> createForm(@Valid @RequestBody FormRequest request) {
        FormDto createdForm = formService.createForm(request);
        return new ResponseEntity<>(ApiResponse.success(createdForm, "Form created successfully"), HttpStatus.CREATED);
    }

    @Operation(summary = "Get form details", description = "Find a specific form using its unique ID.")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FormDto>> getFormById(@Parameter(description = "The unique ID of the form") @PathVariable("id") UUID id) {
        FormDto form = formService.getFormById(id);
        return ResponseEntity.ok(ApiResponse.success(form, "Form fetched successfully"));
    }

    @Operation(summary = "Get form by short name", description = "Find a form using its custom URL name (slug).")
    @GetMapping("/s/{slug}")
    public ResponseEntity<ApiResponse<FormDto>> getFormBySlug(@Parameter(description = "The short URL name of the form") @PathVariable("slug") String slug) {
        FormDto form = formService.getFormBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(form, "Form fetched successfully"));
    }

    @Operation(summary = "List all forms", description = "Browse all forms with options to search, filter by status, or sort.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FormDto>>> getAllForms(
            @Parameter(description = "Search by form name") @RequestParam(name = "search", required = false) String search,
            @Parameter(description = "Filter by active or inactive status") @RequestParam(name = "status", required = false) com.formcraft.enums.FormStatus status,
            @Parameter(description = "Start date for filtering") @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date for filtering") @RequestParam(name = "endDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate,
            @org.springdoc.core.annotations.ParameterObject @org.springframework.data.web.PageableDefault(sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        Page<FormDto> forms = formService.getAllForms(search, status, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(forms, "All forms fetched successfully"));
    }

    @Operation(summary = "Submit form response", description = "Send in answers for a specific form.")
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<ResponseDto>> submitResponse(@Valid @RequestBody SubmissionRequest request) {
        ResponseDto response = formService.submitResponse(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Response submitted successfully"), HttpStatus.CREATED);
    }

    @Operation(summary = "View form responses", description = "See all the answers people have submitted for this form.")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/responses")
    public ResponseEntity<ApiResponse<Page<ResponseDto>>> getResponses(
            @Parameter(description = "The ID of the form") @PathVariable("id") UUID id,
            @Parameter(description = "Start date filter") @RequestParam(name = "startDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @Parameter(description = "End date filter") @RequestParam(name = "endDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate,
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        Page<ResponseDto> responses = formService.getResponsesByFormId(id, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(responses, "Responses fetched successfully"));
    }

    @Operation(summary = "Download responses as CSV", description = "Save all form answers into a spreadsheet-friendly file.")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/responses/export")
    public ResponseEntity<org.springframework.core.io.Resource> exportResponses(
            @Parameter(description = "The ID of the form") @PathVariable("id") UUID id,
            @Parameter(description = "Start date filter") @RequestParam(name = "startDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @Parameter(description = "End date filter") @RequestParam(name = "endDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate) {
        
        byte[] csvData = formService.exportResponsesToCsv(id, startDate, endDate);
        org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(csvData);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=responses_" + id + ".csv")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv")
                .contentLength(csvData.length)
                .body(resource);
    }

    @Operation(summary = "Turn form on or off", description = "Enable or disable a form for new submissions.")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<FormDto>> toggleStatus(@Parameter(description = "The ID of the form") @PathVariable("id") UUID id) {
        FormDto updatedForm = formService.toggleFormStatus(id);
        String statusLabel = updatedForm.getStatus() == com.formcraft.enums.FormStatus.ACTIVE ? "Activated" : "Deactivated";
        return ResponseEntity.ok(ApiResponse.success(updatedForm, "Form " + statusLabel + " successfully"));
    }

    @Operation(summary = "Schedule form closing", description = "Set a form to automatically close after a certain number of days.")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<FormDto>> scheduleDeactivation(@Parameter(description = "The ID of the form") @PathVariable("id") UUID id, @Parameter(description = "Number of days until the form closes") @RequestParam(name = "days") int days) {
        FormDto updatedForm = formService.scheduleFormDeactivation(id, days);
        return ResponseEntity.ok(ApiResponse.success(updatedForm, "Form scheduled for deactivation in " + days + " days"));
    }

    @Operation(summary = "Delete a form", description = "Permanently remove a form and all the data collected with it.")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteForm(@Parameter(description = "The ID of the form to delete") @PathVariable("id") UUID id) {
        formService.deleteForm(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Form and all its responses deleted successfully"));
    }

    @Operation(summary = "Update form details", description = "Edit the name, fields, or settings of an existing form.")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FormDto>> updateForm(@Parameter(description = "The ID of the form to update") @PathVariable("id") UUID id, @Valid @RequestBody FormRequest request) {
        FormDto updatedForm = formService.updateForm(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedForm, "Form updated successfully"));
    }
}
