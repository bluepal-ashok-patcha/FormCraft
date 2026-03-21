package com.formcraft.service;

import com.formcraft.dto.request.LoginRequest;

import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.dto.response.JwtResponse;

public interface AuthService {
    JwtResponse login(LoginRequest loginRequest);
    String register(RegisterRequest registerRequest);
    void verifyRegistrationOtp(String email, String otp);
    void forgotPasswordRequest(String emailOrUsername);
    void resetPasswordWithOtp(String emailOrUsername, String otp, String newPassword);
    void logout();
}
