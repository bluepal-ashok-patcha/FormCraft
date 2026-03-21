package com.formcraft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@io.swagger.v3.oas.annotations.media.Schema(description = "A group for organizing templates.")
public class CategoryDTO {
    @io.swagger.v3.oas.annotations.media.Schema(description = "The unique ID for the category.")
    private Integer id;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The name used by the system.")
    private String name;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The name shown to users.")
    private String label;
}
