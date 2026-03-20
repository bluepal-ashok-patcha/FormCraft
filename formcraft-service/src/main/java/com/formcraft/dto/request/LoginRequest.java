package com.formcraft.dto.request;

import lombok.Data;

@Data
@io.swagger.v3.oas.annotations.media.Schema(description = "Neural Link Request: A high-fidelity data packet used to establish a secure JWT session within the platform.")
public class LoginRequest {
    @io.swagger.v3.oas.annotations.media.Schema(description = "Registered identifier (Username or Email) for the established identity.")
    private String usernameOrEmail;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Existing secure access key for identity verification.")
    private String password;
}
