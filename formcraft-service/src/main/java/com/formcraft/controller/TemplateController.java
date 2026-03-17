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

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<TemplateDTO>> createTemplate(@RequestBody TemplateDTO templateDTO) {
        TemplateDTO created = templateService.createTemplate(templateDTO);
        return new ResponseEntity<>(ApiResponse.success(created, "Template created successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TemplateDTO>>> getAllVisibleTemplates(
            @RequestParam(name = "global", required = false) String filter) {
        List<TemplateDTO> templates = templateService.getAllVisibleTemplates(filter);
        return ResponseEntity.ok(ApiResponse.success(templates, "Templates fetched successfully"));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories() {
        List<CategoryDTO> categories = templateService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories, "Categories fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateDTO>> getTemplateById(@PathVariable("id") UUID id) {
        TemplateDTO template = templateService.getTemplateById(id);
        return ResponseEntity.ok(ApiResponse.success(template, "Template fetched successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(@RequestBody CategoryDTO categoryDTO) {
        CategoryDTO created = templateService.createCategory(categoryDTO);
        return new ResponseEntity<>(ApiResponse.success(created, "Category created successfully"), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable("id") Integer id) {
        templateService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/request-promotion")
    public ResponseEntity<ApiResponse<TemplateDTO>> requestGlobalPromotion(@PathVariable("id") UUID id) {
        TemplateDTO requested = templateService.requestGlobalPromotion(id);
        return ResponseEntity.ok(ApiResponse.success(requested, "Promotion to Global Asset requested successfully"));
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/{id}/promote")
    public ResponseEntity<ApiResponse<TemplateDTO>> promoteToGlobal(@PathVariable("id") UUID id) {
        TemplateDTO promoted = templateService.promoteToGlobal(id);
        return ResponseEntity.ok(ApiResponse.success(promoted, "Template promoted to Global Assets successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@PathVariable("id") UUID id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Template deleted successfully"));
    }
}
