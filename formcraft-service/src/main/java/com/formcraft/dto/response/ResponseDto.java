package com.formcraft.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ResponseDto {
    private UUID id;
    private UUID formId;
    private java.util.Map<String, Object> responseData;
    private LocalDateTime submittedAt;
}
