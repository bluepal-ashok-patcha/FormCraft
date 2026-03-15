package com.formcraft.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class SubmissionRequest {
    @NotNull(message = "Form ID is required")
    private UUID formId;

    @NotNull(message = "Response data is required")
    private Map<String, Object> responses;
}
