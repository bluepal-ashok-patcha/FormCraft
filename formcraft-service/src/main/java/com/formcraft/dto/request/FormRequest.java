package com.formcraft.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@io.swagger.v3.oas.annotations.media.Schema(description = "Details needed to create or update a form.")
public class FormRequest {
    @NotBlank(message = "Form name is required")
    @io.swagger.v3.oas.annotations.media.Schema(description = "The name of your form.")
    private String name;

    @NotNull(message = "Form schema is required")
    @io.swagger.v3.oas.annotations.media.Schema(description = "The structure of your form, including all fields and their settings.")
    private java.util.Map<String, Object> schema;

    @io.swagger.v3.oas.annotations.media.Schema(description = "When the form should start being available.")
    private java.time.LocalDateTime startsAt;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "When the form should stop being available.")
    private java.time.LocalDateTime expiresAt;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The web address for the image at the top of your form.")
    private String bannerUrl;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The main color for your form's design.")
    private String themeColor;
}
