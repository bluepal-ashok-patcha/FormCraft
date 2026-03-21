package com.formcraft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@io.swagger.v3.oas.annotations.media.Schema(description = "Information about a form template.")
public class TemplateDTO {
    @io.swagger.v3.oas.annotations.media.Schema(description = "The unique ID for this template.")
    private UUID id;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The name of the template.")
    private String name;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "A short description of what the template is for.")
    private String description;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The category this template belongs to.")
    private CategoryDTO category;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The structure and fields of the template.")
    private Map<String, Object> schema;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Whether this template is available to everyone.")
    private boolean global;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Whether someone has requested this be made global.")
    private boolean requestedForGlobal;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "When the template was created.")
    private LocalDateTime createdAt;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The name of the person who created it.")
    private String createdBy;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "A link to a small preview image.")
    private String thumbnailUrl;
}
