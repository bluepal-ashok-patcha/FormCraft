package com.formcraft.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@io.swagger.v3.oas.annotations.media.Schema(description = "Details of a form submission.")
public class ResponseDto {
    @io.swagger.v3.oas.annotations.media.Schema(description = "The unique ID profile for this response.")
    private UUID id;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The ID of the form that was answered.")
    private UUID formId;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The answers provided in the form.")
    private java.util.Map<String, Object> responseData;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "When the answers were submitted.")
    private LocalDateTime submittedAt;
}
