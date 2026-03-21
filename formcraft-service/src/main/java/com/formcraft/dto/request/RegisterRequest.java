package com.formcraft.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@io.swagger.v3.oas.annotations.media.Schema(description = "Details required to create a new account.")
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @io.swagger.v3.oas.annotations.media.Schema(description = "The unique name you'll use to log in.")
    private String username;

    @NotBlank(message = "Full name is required")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Your full name.")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Your email address for notifications and security.")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Your secret password (at least 6 characters).")
    private String password;
}
