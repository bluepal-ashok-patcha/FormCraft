package com.formcraft.controller;

import com.formcraft.dto.request.LoginRequest;
import com.formcraft.dto.response.ApiResponse;
import com.formcraft.dto.response.JwtResponse;
import com.formcraft.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.formcraft.dto.request.TokenRefreshRequest;
import com.formcraft.entity.RefreshToken;
import com.formcraft.security.jwt.JwtTokenProvider;
import com.formcraft.service.RefreshTokenService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.formcraft.dto.request.RegisterRequest;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication Strategy", description = "Protocols for secure identity indexing and neural link establishment.")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @io.swagger.v3.oas.annotations.Operation(summary = "Establish Neural Link", description = "Authenticates a user and returns a synchronized JWT access token.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Link Established: Token synthesized."),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Security Rejection: Invalid credentials.")
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(jwtResponse, "Login successful"));
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "Index New Identity", description = "Registers a new user in the enterprise perimeter and establishes access protocols.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Identity Synchronized: Registration complete."),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Strategic Conflict: Identity already indexed.")
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        String response = authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Registration successful"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    String token = jwtTokenProvider.generateToken(authentication);
                    
                    JwtResponse response = new JwtResponse();
                    response.setAccessToken(token);
                    response.setRefreshToken(requestRefreshToken);
                    return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logoutUser() {
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success(null, "Log out successful!"));
    }
}
