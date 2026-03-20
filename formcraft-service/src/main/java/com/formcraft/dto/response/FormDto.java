package com.formcraft.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@io.swagger.v3.oas.annotations.media.Schema(description = "Strategic Blueprint: A high-fidelity architectural map of an enterprise form.")
public class FormDto {
    @io.swagger.v3.oas.annotations.media.Schema(description = "Unique Identifier of the form blueprint.")
    private UUID id;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Human-readable name of the form architecture.")
    private String name;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "High-fidelity, SEO-safe URL identifier.")
    private String slug;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Neural Schema: Dynamic mapping of form components and fields.")
    private java.util.Map<String, Object> schema;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Current deployment status of the form link.")
    private com.formcraft.enums.FormStatus status;
    
    private LocalDateTime expiresAt;
    private LocalDateTime startsAt;
    private LocalDateTime createdAt;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Real-time count of total gathered responses.")
    private long responseCount;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Visual banner URL for premium branding.")
    private String bannerUrl;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Strategic hex color for the form's aesthetic identity.")
    private String themeColor;
}
