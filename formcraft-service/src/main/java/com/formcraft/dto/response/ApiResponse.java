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
@io.swagger.v3.oas.annotations.media.Schema(description = "A standard container for all responses from the system, whether they are successful or have an error.")
public class ApiResponse<T> {
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Will be true if the action was successful.")
    private boolean success;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "A message explaining the result or any error that occurred.")
    private String message;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The actual data requested or the result of the action.")
    private T data;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The exact time when the response was created.")
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
