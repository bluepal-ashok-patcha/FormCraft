package com.formcraft.controller;

import com.formcraft.dto.CategoryDTO;
import com.formcraft.dto.TemplateDTO;
import com.formcraft.dto.response.ApiResponse;
import com.formcraft.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@Tag(name = "Form Templates", description = "Ready-made form designs you can use to build forms quickly.")
@CrossOrigin("*")
public class TemplateController {

    private final TemplateService templateService;

    @Operation(summary = "Create a new template", description = "Save a form design as a template for future use.")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
public ResponseEntity<ApiResponse<TemplateDTO>> createTemplate(@RequestBody TemplateDTO templateDTO) {
        TemplateDTO created = templateService.createTemplate(templateDTO);
        return new ResponseEntity<>(ApiResponse.success(created, "Template created successfully"), HttpStatus.CREATED);
    }

    @Operation(summary = "Update a template", description = "Edit the details of an existing form template.")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateDTO>> updateTemplate(@Parameter(description = "The ID of the template") @PathVariable("id") UUID id, @RequestBody TemplateDTO templateDTO) {
        TemplateDTO updated = templateService.updateTemplate(id, templateDTO);
        return ResponseEntity.ok(ApiResponse.success(updated, "Template refined successfully"));
    }

    @Operation(summary = "List all templates", description = "Browse all available form templates.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TemplateDTO>>> getAllVisibleTemplates(
            @Parameter(description = "Filter templates (e.g., 'true' for global ones)") @RequestParam(name = "global", required = false) String filter) {
        List<TemplateDTO> templates = templateService.getAllVisibleTemplates(filter);
        return ResponseEntity.ok(ApiResponse.success(templates, "Templates fetched successfully"));
    }

    @Operation(summary = "Get all categories", description = "List all the categories used to group templates.")
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories() {
        List<CategoryDTO> categories = templateService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories, "Categories fetched successfully"));
    }

    @Operation(summary = "Get template details", description = "View the details of a specific form template.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateDTO>> getTemplateById(@Parameter(description = "The ID of the template") @PathVariable("id") UUID id) {
        TemplateDTO template = templateService.getTemplateById(id);
        return ResponseEntity.ok(ApiResponse.success(template, "Template fetched successfully"));
    }

    @Operation(summary = "Create a category", description = "Add a new category to group templates.")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(@RequestBody CategoryDTO categoryDTO) {
        CategoryDTO created = templateService.createCategory(categoryDTO);
        return new ResponseEntity<>(ApiResponse.success(created, "Category created successfully"), HttpStatus.CREATED);
    }

    @Operation(summary = "Delete a category", description = "Remove an existing template category.")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@Parameter(description = "The ID of the category") @PathVariable("id") Integer id) {
        templateService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }

    @Operation(summary = "Submit for global list", description = "Request that your template be added to the global collection for everyone to use.")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/request-promotion")
    public ResponseEntity<ApiResponse<TemplateDTO>> requestGlobalPromotion(@Parameter(description = "The ID of the template") @PathVariable("id") UUID id) {
        TemplateDTO requested = templateService.requestGlobalPromotion(id);
        return ResponseEntity.ok(ApiResponse.success(requested, "Promotion to Global Asset requested successfully"));
    }

    @Operation(summary = "Approve for global list", description = "Approve a template to be part of the global collection.")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/{id}/promote")
    public ResponseEntity<ApiResponse<TemplateDTO>> promoteToGlobal(@Parameter(description = "The ID of the template") @PathVariable("id") UUID id) {
        TemplateDTO promoted = templateService.promoteToGlobal(id);
        return ResponseEntity.ok(ApiResponse.success(promoted, "Template promoted to Global Assets successfully"));
    }

    @Operation(summary = "Remove from global list", description = "Take a template off the global collection.")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/{id}/decertify")
    public ResponseEntity<ApiResponse<TemplateDTO>> decertifyTemplate(@Parameter(description = "The ID of the template") @PathVariable("id") UUID id) {
        TemplateDTO decertified = templateService.decertifyTemplate(id);
        return ResponseEntity.ok(ApiResponse.success(decertified, "Template de-indexed from Global Assets successfully"));
    }

    @Operation(summary = "Reject global request", description = "Deny a request to add a template to the global collection.")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<TemplateDTO>> rejectPromotion(@Parameter(description = "The ID of the template") @PathVariable("id") UUID id) {
        TemplateDTO rejected = templateService.rejectPromotion(id);
        return ResponseEntity.ok(ApiResponse.success(rejected, "Promotion request successfully cancelled"));
    }

    @Operation(summary = "Withdraw global request", description = "Cancel your own request to add a template to the global collection.")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/cancel-request")
    public ResponseEntity<ApiResponse<TemplateDTO>> cancelPromotionRequest(@Parameter(description = "The ID of the template") @PathVariable("id") UUID id) {
        TemplateDTO canceled = templateService.cancelPromotionRequest(id);
        return ResponseEntity.ok(ApiResponse.success(canceled, "Promotion request successfully withdrawn"));
    }

    @Operation(summary = "Delete template", description = "Permanently remove a template.")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@Parameter(description = "The ID of the template to delete") @PathVariable("id") UUID id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Template deleted successfully"));
    }
}
