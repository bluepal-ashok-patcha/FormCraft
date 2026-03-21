package com.formcraft.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
@io.swagger.v3.oas.annotations.media.Schema(description = "Details for submitting answers to a form.")
public class SubmissionRequest {
    @NotNull(message = "Form ID is required")
    @io.swagger.v3.oas.annotations.media.Schema(description = "The unique ID of the form you are answering.")
    private UUID formId;

    @NotNull(message = "Response data is required")
    @io.swagger.v3.oas.annotations.media.Schema(description = "The answers provided for the form fields.")
    private Map<String, Object> responses;
}
