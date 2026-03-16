package com.formcraft.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class FormDto {
    private UUID id;
    private String name;
    private String slug;
    private java.util.Map<String, Object> schema;
    private com.formcraft.enums.FormStatus status;
    private LocalDateTime expiresAt;
    private LocalDateTime startsAt;
    private LocalDateTime createdAt;
    private long responseCount;
}
