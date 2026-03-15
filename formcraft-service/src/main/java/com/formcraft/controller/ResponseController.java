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
    public ResponseEntity<ApiResponse<ResponseDto>> updateResponse(@PathVariable("id") UUID id, @RequestBody Map<String, Object> responses) {
        ResponseDto updatedResponse = formService.updateResponse(id, responses);
        return ResponseEntity.ok(ApiResponse.success(updatedResponse, "Response updated successfully"));
    }
}
