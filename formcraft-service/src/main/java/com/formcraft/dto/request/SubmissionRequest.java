package com.formcraft.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
@io.swagger.v3.oas.annotations.media.Schema(description = "Mission Submission: A high-fidelity data packet containing orchestrated form responses.")
public class SubmissionRequest {
    @NotNull(message = "Form ID is required")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Target Identifier: Current index of the form blueprint receiving the data link.")
    private UUID formId;

    @NotNull(message = "Response data is required")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Neural Payload: Dynamic mapping of user-submitted strategic data captured from form fields.")
    private Map<String, Object> responses;
}
