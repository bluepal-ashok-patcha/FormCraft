package com.formcraft.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@io.swagger.v3.oas.annotations.media.Schema(description = "Details needed to keep your session active.")
public class TokenRefreshRequest {
    @NotBlank
    @io.swagger.v3.oas.annotations.media.Schema(description = "The special code used to renew your login session.")
    private String refreshToken;
}
