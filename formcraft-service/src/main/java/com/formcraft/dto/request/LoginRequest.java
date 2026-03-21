package com.formcraft.dto.request;

import lombok.Data;

@Data
@io.swagger.v3.oas.annotations.media.Schema(description = "Details required to log into your account.")
public class LoginRequest {
    @io.swagger.v3.oas.annotations.media.Schema(description = "Your username or your email address.")
    private String usernameOrEmail;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Your secret password.")
    private String password;
}
