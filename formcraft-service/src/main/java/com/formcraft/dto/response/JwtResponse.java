package com.formcraft.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class JwtResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private String username;
    private String email;
    private String fullName;
    private List<String> roles;
}
