package com.formcraft.controller;

import com.formcraft.dto.request.LoginRequest;
import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.dto.request.TokenRefreshRequest;
import com.formcraft.dto.response.ApiResponse;
import com.formcraft.dto.response.JwtResponse;
import com.formcraft.entity.RefreshToken;
import com.formcraft.security.jwt.JwtTokenProvider;
import com.formcraft.service.AuthService;
import com.formcraft.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Security", description = "Actions for logging in, creating accounts, and managing passwords.")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Operation(summary = "Login to account", description = "Enter your email and password to access your account.")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(jwtResponse, "Login successful"));
    }

    @Operation(summary = "Create new account", description = "Sign up to start building and managing forms.")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        String response = authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.success(response, response));
    }

    @Operation(summary = "Keep session active", description = "Refresh your login so you don't have to sign in again.")
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
                    return ResponseEntity.ok(ApiResponse.success(response, "Session updated successfully"));
                })
                .orElseThrow(() -> new RuntimeException("Error: Invalid session token."));
    }

    @Operation(summary = "Logout", description = "Safely end your current session.")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logoutUser() {
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully."));
    }

    @Operation(summary = "Verify account", description = "Activate your account and log in automatically using the code sent to your email.")
    @PostMapping("/verify-registration")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyRegistration(@Parameter(description = "Your email address") @RequestParam(name = "email") String email, 
                                                                  @Parameter(description = "The code you received in your email") @RequestParam(name = "otp") String otp) {
        JwtResponse response = authService.verifyRegistrationOtp(email, otp);
        return ResponseEntity.ok(ApiResponse.success(response, "Account activated and logged in successfully."));
    }

    @Operation(summary = "Resend verification code", description = "Get a new code if your previous one expired or was lost.")
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<String>> resendVerification(@Parameter(description = "Your email address") @RequestParam(name = "email") String email) {
        authService.resendVerificationOtp(email);
        return ResponseEntity.ok(ApiResponse.success("Verification code resent successfully.", "Success"));
    }

    @Operation(summary = "Forgot password request", description = "Ask for a password reset code if you can't log in.")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Parameter(description = "Your email or username") @RequestParam(name = "identity") String identity) {
        authService.forgotPasswordRequest(identity);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email successfully.", "Request complete"));
    }

    @Operation(summary = "Set new password", description = "Create a new password and log in immediately using the reset code you were sent.")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<JwtResponse>> resetPassword(@Parameter(description = "Your email or username") @RequestParam(name = "identity") String identity,
                                                            @Parameter(description = "The reset code you received") @RequestParam(name = "otp") String otp,
                                                            @Parameter(description = "Your new password") @RequestParam(name = "newPassword") String newPassword) {
        JwtResponse response = authService.resetPasswordWithOtp(identity, otp, newPassword);
        return ResponseEntity.ok(ApiResponse.success(response, "Password reset and logged in successfully."));
    }
}
