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

@RestController
@RequestMapping("/api/responses")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Strategic Response Intelligence", description = "Management protocols for gathered form data and submission tracking.")
public class ResponseController {

    private final FormService formService;

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResponse(@PathVariable("id") UUID id) {
        formService.deleteResponse(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Response deleted successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "Update Strategic Response", description = "Modifies existing response data via a dynamic JSON mapping.")
    public ResponseEntity<ApiResponse<ResponseDto>> updateResponse(
            @PathVariable("id") UUID id, 
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Map of response changes") @RequestBody Map<String, Object> responses) {
        ResponseDto updatedResponse = formService.updateResponse(id, responses);
        return ResponseEntity.ok(ApiResponse.success(updatedResponse, "Response updated successfully"));
    }
}
