package com.formcraft.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class FormValidatorTest {

    private FormValidator formValidator;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        formValidator = new FormValidator(objectMapper);
    }

    @Test
    void validate_WithCorrectId_ShouldPass() {
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("id", "f1", "label", "Full Name", "type", "text", "required", true)
        ));
        Map<String, Object> responses = Map.of("f1", "John Doe");

        assertDoesNotThrow(() -> formValidator.validate(schema, responses));
    }

    @Test
    void validate_WithMissingRequiredId_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("id", "f1", "label", "Full Name", "type", "text", "required", true)
        ));
        Map<String, Object> responses = new HashMap<>(); // Empty responses

        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> formValidator.validate(schema, responses));
        
        assertEquals("Field 'Full Name' is required.", exception.getMessage());
    }

    @Test
    void validate_WithNoIdFallbackToLabel_ShouldPass() {
        // Test case where schema lacks an 'id', so it must use 'label'
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("label", "Email", "type", "email", "required", true)
        ));
        Map<String, Object> responses = Map.of("Email", "test@example.com");

        assertDoesNotThrow(() -> formValidator.validate(schema, responses));
    }

    @Test
    void validate_InvalidEmail_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("id", "e1", "label", "Corporate Email", "type", "email", "required", true)
        ));
        Map<String, Object> responses = Map.of("e1", "invalid-email");

        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> formValidator.validate(schema, responses));
        
        assertEquals("Field 'Corporate Email' must be a valid email address.", exception.getMessage());
    }
}
