package com.formcraft.controller;

import com.formcraft.dto.response.ApiResponse;
import com.formcraft.dto.response.ResponseDto;
import com.formcraft.service.FormService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

@Slf4j
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
        log.warn("Operational Purge: Deleting response entry identified by ID '{}'", id);
        formService.deleteResponse(id);
        log.info("Purge Complete: Response ID '{}' cleared from data stream.", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Response deleted successfully"));
    }

    @Operation(summary = "Edit a response", description = "Update the answers in an existing form submission.")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResponseDto>> updateResponse(
            @Parameter(description = "The unique ID of the response to update") @PathVariable("id") UUID id, 
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "The new answers for this response") @RequestBody Map<String, Object> responses) {
        log.info("Data Recalibration: Updating content for response ID '{}'", id);
        ResponseDto updatedResponse = formService.updateResponse(id, responses);
        log.info("Recalibration Complete: Response ID '{}' synchronized with new data.", id);
        return ResponseEntity.ok(ApiResponse.success(updatedResponse, "Response updated successfully"));
    }
}
