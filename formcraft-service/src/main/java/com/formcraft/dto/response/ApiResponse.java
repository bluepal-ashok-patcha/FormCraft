package com.formcraft.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@io.swagger.v3.oas.annotations.media.Schema(description = "Enterprise Data Capsule: A standardized success or error protocol for all system interactions.")
public class ApiResponse<T> {
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "True if the strategic link was established successfully.")
    private boolean success;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Industry-standard status or error message.")
    private String message;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Payload of the high-fidelity response data.")
    private T data;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The precise millisecond of the system event orchestration.")
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
