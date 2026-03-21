package com.formcraft.controller;

import com.formcraft.dto.response.ApiResponse;
import com.formcraft.service.GeminiService;
import com.formcraft.exception.AiProtocolException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Tools", description = "Smart assistant tools to help you create forms and validation rules.")
@CrossOrigin(origins = "*") 
public class GeminiController {

    private final GeminiService geminiService;

    @Operation(summary = "Generate validation rules", description = "Ask AI to create complex validation rules for your form fields.")
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

    @Operation(summary = "Draft form structure", description = "Describe what you want, and AI will suggest fields for your form.")
    @PostMapping("/generate-blueprint")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> generateBlueprint(
            @RequestBody Map<String, Object> request) {
        String description = (String) request.get("description");
        List<Map<String, Object>> currentFields = (List<Map<String, Object>>) request.get("currentFields");
        
        log.info("Blueprint Extraction: Synthesizing architecture for '{}'", description);
        if (description == null || description.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Architecture vision required."));
        }

        try {
            String aiJson = geminiService.generateFormBlueprint(description, currentFields).block();
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<Map<String, Object>> fields = mapper.readValue(aiJson, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
            
            return ResponseEntity.ok(ApiResponse.success(fields, "Blueprint synthesized successfully."));
        } catch (Exception e) {
            throw new AiProtocolException(e.getMessage() != null ? e.getMessage() : "Blueprint synthesis failure");
        }
    }

    @Operation(summary = "Suggest form design", description = "Get AI-powered recommendations for colors and styling based on your form's title.")
    @PostMapping("/recommend-theme")
    public ResponseEntity<ApiResponse<Map<String, String>>> recommendTheme(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Form title is required for styling vision."));
        }

        try {
            String aiJson = geminiService.generateThemeBlueprint(title).block();
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, String> design = mapper.readValue(aiJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
            
            return ResponseEntity.ok(ApiResponse.success(design, "Styling blueprint synthesized successfully."));
        } catch (Exception e) {
            throw new AiProtocolException(e.getMessage() != null ? e.getMessage() : "Styling synthesis failure");
        }
    }
}
