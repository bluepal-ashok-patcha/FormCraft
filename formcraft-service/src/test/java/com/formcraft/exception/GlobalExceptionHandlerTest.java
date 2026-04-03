package com.formcraft.exception;

import com.formcraft.dto.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleResourceNotFoundException_ShouldReturn404() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleResourceNotFoundException(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Not found", response.getBody().getMessage());
    }

    @Test
    void handleBadRequestException_ShouldReturn400() {
        BadRequestException ex = new BadRequestException("Bad request");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleBadRequestException(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Bad request", response.getBody().getMessage());
    }

    @Test
    void handleBusinessLogicException_ShouldReturn422() {
        BusinessLogicException ex = new BusinessLogicException("Biz error");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleBusinessLogicException(ex);

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Error: Biz error", response.getBody().getMessage());
    }

    @Test
    void handleAiProtocolException_ShouldReturn503() {
        AiProtocolException ex = new AiProtocolException("AI error");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleAiProtocolException(ex);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("AI Service Error: AI error", response.getBody().getMessage());
    }

    @Test
    void handleLockedException_ShouldReturn423() {
        AccountLockedException ex = new AccountLockedException("Locked");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleLockedException(ex);

        assertEquals(HttpStatus.LOCKED, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Locked", response.getBody().getMessage());
    }

    @Test
    void handleFormCraftException_ShouldReturnCustomStatus() {
        FormCraftException ex = new FormCraftException(HttpStatus.I_AM_A_TEAPOT, "Teapot");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleFormCraftException(ex);

        assertEquals(HttpStatus.I_AM_A_TEAPOT, response.getStatusCode());
        assertEquals("Teapot", response.getBody().getMessage());
    }

    @Test
    void handleGeneralException_ShouldReturn500() {
        Exception ex = new Exception("Critical error");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleGeneralException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertTrue(response.getBody().getMessage().contains("Internal Server Error"));
    }
}
