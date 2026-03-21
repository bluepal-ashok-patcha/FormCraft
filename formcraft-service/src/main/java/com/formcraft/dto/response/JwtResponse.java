package com.formcraft.dto.response;

import lombok.Data;
import java.util.List;

@Data
@io.swagger.v3.oas.annotations.media.Schema(description = "Details about your login session.")
public class JwtResponse {
    @io.swagger.v3.oas.annotations.media.Schema(description = "The main access token for your session.")
    private String accessToken;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The token used to refresh your session.")
    private String refreshToken;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The type of token being used.")
    private String tokenType = "Bearer";
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Your unique username.")
    private String username;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Your email address.")
    private String email;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Your full name.")
    private String fullName;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The permissions assigned to your account.")
    private List<String> roles;
}
