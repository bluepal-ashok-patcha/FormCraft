package com.formcraft.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
@io.swagger.v3.oas.annotations.media.Schema(description = "Information about a form.")
public class FormDto {
    @io.swagger.v3.oas.annotations.media.Schema(description = "The unique ID of the form.")
    private UUID id;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The name of the form.")
    private String name;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The friendly URL name for the form link.")
    private String slug;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The structure of the form, including all its fields.")
    private java.util.Map<String, Object> schema;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Whether the form is currently active or not.")
    private com.formcraft.enums.FormStatus status;
    
    private LocalDateTime expiresAt;
    private LocalDateTime startsAt;
    private LocalDateTime createdAt;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The total number of responses received for this form.")
    private long responseCount;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The web address for the image at the top of the form.")
    private String bannerUrl;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The primary color used for the form's design.")
    private String themeColor;
}
