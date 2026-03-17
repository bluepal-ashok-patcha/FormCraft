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
public class TemplateDTO {
    private UUID id;
    private String name;
    private String description;
    private CategoryDTO category;
    private Map<String, Object> schema;
    private boolean global;
    private LocalDateTime createdAt;
    private String createdBy;
    private String thumbnailUrl;
}
