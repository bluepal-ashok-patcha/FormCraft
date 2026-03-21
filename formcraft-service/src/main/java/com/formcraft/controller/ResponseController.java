package com.formcraft.controller;

import com.formcraft.dto.response.ApiResponse;
import com.formcraft.dto.response.ResponseDto;
import com.formcraft.service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/responses")
@RequiredArgsConstructor
@Tag(name = "Form Responses", description = "View and manage all the answers people have submitted through your forms.")
public class ResponseController {

    private final FormService formService;

    @Operation(summary = "Remove a response", description = "Permanently delete a single form submission.")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResponse(@Parameter(description = "The unique ID of the response to delete") @PathVariable("id") UUID id) {
        formService.deleteResponse(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Response deleted successfully"));
    }

    @Operation(summary = "Edit a response", description = "Update the answers in an existing form submission.")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResponseDto>> updateResponse(
            @Parameter(description = "The unique ID of the response to update") @PathVariable("id") UUID id, 
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "The new answers for this response") @RequestBody Map<String, Object> responses) {
        ResponseDto updatedResponse = formService.updateResponse(id, responses);
        return ResponseEntity.ok(ApiResponse.success(updatedResponse, "Response updated successfully"));
    }
}
