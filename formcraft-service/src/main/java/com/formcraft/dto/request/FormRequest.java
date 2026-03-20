package com.formcraft.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@io.swagger.v3.oas.annotations.media.Schema(description = "Architecture Request: A high-fidelity data packet used to establish or modify a form's strategic blueprint.")
public class FormRequest {
    @NotBlank(message = "Form name is required")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Human-readable mission name for the form architecture.")
    private String name;

    @NotNull(message = "Form schema is required")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Neural Schema: The complex dynamic mapping of form components, fields, and validation logic.")
    private java.util.Map<String, Object> schema;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Scheduled start time for the form's strategic link deployment.")
    private java.time.LocalDateTime startsAt;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Scheduled expiration time for the form's strategic link deactivation.")
    private java.time.LocalDateTime expiresAt;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Visual banner URL for premium branding.")
    private String bannerUrl;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Strategic hex color for the form's aesthetic identity.")
    private String themeColor;
}
