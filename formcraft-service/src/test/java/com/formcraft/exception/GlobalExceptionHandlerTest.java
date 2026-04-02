package com.formcraft.exception;

import com.formcraft.dto.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleResourceNotFoundException_ShouldReturn404() {
        // Arrange
        ResourceNotFoundException ex = new ResourceNotFoundException("Form not found");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleResourceNotFoundException(ex);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Form not found", response.getBody().getMessage());
    }

    @Test
    void handleBadRequestException_ShouldReturn400() {
        // Arrange
        BadRequestException ex = new BadRequestException("Invalid Protocol");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleBadRequestException(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid Protocol", response.getBody().getMessage());
    }

    @Test
    void handleBusinessLogicException_ShouldReturn422() {
        // Arrange
        BusinessLogicException ex = new BusinessLogicException("Logic Fault");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleBusinessLogicException(ex);

        // Assert
        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("Logic Fault"));
    }

    @Test
    void handleAccessDeniedException_ShouldReturn403() {
        // Arrange
        org.springframework.security.access.AccessDeniedException ex = new org.springframework.security.access.AccessDeniedException("Denied");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleAccessDeniedException(ex);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("permission"));
    }

    @Test
    void handleBadCredentialsException_ShouldReturn401() {
        // Arrange
        BadCredentialsException ex = new BadCredentialsException("Invalid Login");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleBadCredentialsException(ex);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid Login", response.getBody().getMessage());
    }

    @Test
    void handleGeneralException_ShouldReturn500() {
        // Arrange
        Exception ex = new Exception("System Failure");

        // Act
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleGeneralException(ex);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("Internal Server Error"));
    }

    @Test
    void handleValidationExceptions_ShouldReturn400WithErrors() {
        // Arrange
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("form", "email", "Invalid email format");
        
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));
        when(bindingResult.getErrorCount()).thenReturn(1);

        // Act
        ResponseEntity<ApiResponse<Map<String, String>>> response = exceptionHandler.handleValidationExceptions(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("email", response.getBody().getData().keySet().iterator().next());
        assertEquals("Invalid email format", response.getBody().getData().get("email"));
    }
}
