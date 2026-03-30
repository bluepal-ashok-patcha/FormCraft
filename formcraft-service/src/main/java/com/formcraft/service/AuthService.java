package com.formcraft.service;

import com.formcraft.dto.request.LoginRequest;

import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.dto.response.JwtResponse;

public interface AuthService {
    JwtResponse login(LoginRequest loginRequest);
    String register(RegisterRequest registerRequest);
    JwtResponse verifyRegistrationOtp(String email, String otp);
    void resendVerificationOtp(String email);
    void forgotPasswordRequest(String emailOrUsername);
    JwtResponse resetPasswordWithOtp(String emailOrUsername, String otp, String newPassword);
    void logout();
}
