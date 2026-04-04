package com.formcraft.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

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
    void validate_NullFields_ShouldDoNothing() {
        Map<String, Object> schema = new HashMap<>();
        schema.put("fields", null);
        
        assertDoesNotThrow(() -> formValidator.validate(schema, new HashMap<>()));
    }

    @Test
    void validate_RequiredField_MissingValue_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Name", "type", "text", "required", true)
        ));
        Map<String, Object> responses = new HashMap<>(); // Empty

        BadRequestException ex = assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
        assertTrue(ex.getMessage().contains("Name' is required"));
    }

    @Test
    void validate_NumberType_InvalidFormat_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Age", "type", "number")
        ));
        Map<String, Object> responses = Map.of("f1", "not-a-number");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
        assertTrue(ex.getMessage().contains("must be a number"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"invalid-email", "test@", "@domain.com"})
    void validate_EmailType_InvalidFormat_ShouldThrowException(String email) {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Email", "type", "email")
        ));
        Map<String, Object> responses = Map.of("f1", email);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
        assertTrue(ex.getMessage().contains("must be a valid email address"));
    }

    @Test
    void validate_FileType_InvalidLink_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Resume", "type", "file")
        ));
        Map<String, Object> responses = Map.of("f1", "ftp://malicious.com");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
        assertTrue(ex.getMessage().contains("must contain a secure link"));
    }

    @Test
    void validate_MinLength_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Bio", "type", "text", "validation", Map.of("minLength", 10))
        ));
        Map<String, Object> responses = Map.of("f1", "Short");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
        assertTrue(ex.getMessage().contains("must be at least 10 characters"));
    }

    @Test
    void validate_MaxLength_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Slogan", "type", "text", "validation", Map.of("maxLength", 5))
        ));
        Map<String, Object> responses = Map.of("f1", "Very Long Slogan");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
        assertTrue(ex.getMessage().contains("cannot exceed 5 characters"));
    }

    @Test
    void validate_NumericRange_Min_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Score", "type", "number", "validation", Map.of("min", 10.0))
        ));
        Map<String, Object> responses = Map.of("f1", "5.5");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
        assertTrue(ex.getMessage().contains("must be at least 10.0"));
    }

    @Test
    void validate_NumericRange_Max_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Score", "type", "number", "validation", Map.of("max", 100))
        ));
        Map<String, Object> responses = Map.of("f1", "105");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
        assertTrue(ex.getMessage().contains("cannot exceed 100.0"));
    }

    @Test
    void validate_Regex_ShouldThrowException() {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Phone", "type", "text", "validation", Map.of("regex", "^\\d{3}$"))
        ));
        Map<String, Object> responses = Map.of("f1", "1234"); // Should be exactly 3 digits

        BadRequestException ex = assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
        assertTrue(ex.getMessage().contains("invalid format"));
    }

    @Test
    void validate_CustomErrorMessage_ShouldTakePrecedence() {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Age", "type", "number", "validation", Map.of("min", 18, "errorMessage", "Must be an Adult"))
        ));
        Map<String, Object> responses = Map.of("f1", "15");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> formValidator.validate(schema, responses));
        assertEquals("Must be an Adult", ex.getMessage());
    }

    @Test
    void validate_ValidData_ShouldNotThrow() {
        Map<String, Object> schema = Map.of("fields", List.of(
                Map.of("id", "f1", "label", "Email", "type", "email", "required", true),
                Map.of("id", "f2", "label", "Age", "type", "number", "validation", Map.of("min", 18))
        ));
        Map<String, Object> responses = Map.of(
                "f1", "test@example.com",
                "f2", "25"
        );

        assertDoesNotThrow(() -> formValidator.validate(schema, responses));
    }
}
