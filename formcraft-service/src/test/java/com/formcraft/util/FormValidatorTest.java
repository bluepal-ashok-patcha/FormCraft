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

    @Test
    void validate_MinLengthFailure_WithCustomErrorMessage_ShouldUseCustomMsg() {
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("id", "t1", "label", "Username", "type", "text", 
                   "validation", Map.of("minLength", 5, "errorMessage", "Too short!"))
        ));
        Map<String, Object> responses = Map.of("t1", "user");

        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> formValidator.validate(schema, responses));
        
        assertEquals("Too short!", exception.getMessage());
    }

    @Test
    void validate_MaxLengthFailure_ShouldThrowDefaultException() {
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("id", "t1", "label", "Notes", "type", "text", 
                   "validation", Map.of("maxLength", 5))
        ));
        Map<String, Object> responses = Map.of("t1", "OverLimit");

        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> formValidator.validate(schema, responses));
        
        assertTrue(exception.getMessage().contains("cannot exceed 5 characters"));
    }

    @Test
    void validate_NumericBounds_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("id", "n1", "label", "Age", "type", "number", 
                   "validation", Map.of("min", 18, "max", 65))
        ));

        // Test Min Breach
        Map<String, Object> minResponses = Map.of("n1", "17");
        BadRequestException minEx = assertThrows(BadRequestException.class, 
            () -> formValidator.validate(schema, minResponses));
        assertTrue(minEx.getMessage().contains("must be at least 18.0"));

        // Test Max Breach
        Map<String, Object> maxResponses = Map.of("n1", "66");
        BadRequestException maxEx = assertThrows(BadRequestException.class, 
            () -> formValidator.validate(schema, maxResponses));
        assertTrue(maxEx.getMessage().contains("cannot exceed 65.0"));
    }

    @Test
    void validate_InvalidNumberFormat_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("id", "n1", "label", "Quantity", "type", "number")
        ));
        Map<String, Object> responses = Map.of("n1", "invalid-qty");

        assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
    }

    @Test
    void validate_RegexPattern_ShouldSucceed() {
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("id", "p1", "label", "Postal Code", "type", "text", 
                   "validation", Map.of("regex", "^[0-9]{5}$"))
        ));
        Map<String, Object> responses = Map.of("p1", "12345");

        assertDoesNotThrow(() -> formValidator.validate(schema, responses));
    }

    @Test
    void validate_RegexFailure_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("id", "p1", "label", "Postal Code", "type", "text", 
                   "validation", Map.of("regex", "^[0-9]{5}$"))
        ));
        Map<String, Object> responses = Map.of("p1", "ABCDE");

        assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
    }

    @Test
    void validate_FileFormatCheck_ShouldThrowOnProtocolBreach() {
        Map<String, Object> schema = Map.of("fields", List.of(
            Map.of("id", "f1", "label", "Attachment", "type", "file")
        ));
        Map<String, Object> responses = Map.of("f1", "insecure://file.jpg");

        assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
    }
}
