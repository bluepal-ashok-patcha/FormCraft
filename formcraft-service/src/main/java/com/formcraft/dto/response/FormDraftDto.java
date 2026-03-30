package com.formcraft.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class FormDraftDto {
    private UUID id;
    private UUID formId;
    private String name;
    private Map<String, Object> schema;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
    private String bannerUrl;
    private String themeColor;
    private LocalDateTime updatedAt;
}
