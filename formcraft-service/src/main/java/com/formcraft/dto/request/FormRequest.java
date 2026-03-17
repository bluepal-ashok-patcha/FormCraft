package com.formcraft.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FormRequest {
    @NotBlank(message = "Form name is required")
    private String name;

    @NotNull(message = "Form schema is required")
    private java.util.Map<String, Object> schema;

    private java.time.LocalDateTime startsAt;
    private java.time.LocalDateTime expiresAt;
    private String bannerUrl;
}
