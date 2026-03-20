package com.formcraft.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@io.swagger.v3.oas.annotations.media.Schema(description = "Identity Indexing Packet: A high-fidelity data packet used to synchronize a new user with the enterprise perimeter.")
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Unique human-readable identifier for the new identity.")
    private String username;

    @NotBlank(message = "Full name is required")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Enterprise name descriptor for the user identity.")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @io.swagger.v3.oas.annotations.media.Schema(description = "High-fidelity communication address for secure link synchronization.")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @io.swagger.v3.oas.annotations.media.Schema(description = "Secure access key for the identity's private perimeter.")
    private String password;
}
