package com.formcraft.controller;

import com.formcraft.dto.response.ApiResponse;
import com.formcraft.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*") // Allows calls from frontend
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/generate-regex")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateRegex(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Prompt is required."));
        }

        try {
            // Use block() for simplicity in an MVC environment unless full async is required.
            String aiJson = geminiService.generateContent(prompt).block();
            
            // Parse the AI's JSON response to send as a structured map in the data field
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, String> data = mapper.readValue(aiJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
            
            return ResponseEntity.ok(ApiResponse.success(data, "Neural validation logic synthesized."));
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : e.toString();
            return ResponseEntity.status(500).body(ApiResponse.error("Neural link failure: " + errorMsg));
        }
    }

    @PostMapping("/generate-blueprint")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> generateBlueprint(@RequestBody Map<String, Object> request) {
        String description = (String) request.get("description");
        List<Map<String, Object>> currentFields = (List<Map<String, Object>>) request.get("currentFields");
        
        if (description == null || description.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Architecture vision required."));
        }

        try {
            String aiJson = geminiService.generateFormBlueprint(description, currentFields).block();
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<Map<String, Object>> fields = mapper.readValue(aiJson, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
            
            return ResponseEntity.ok(ApiResponse.success(fields, "Blueprint synthesized successfully."));
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : e.toString();
            return ResponseEntity.status(500).body(ApiResponse.error("Synthesis failure: " + errorMsg));
        }
    }
}
