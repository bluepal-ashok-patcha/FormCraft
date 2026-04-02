package com.formcraft.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.dto.request.LoginRequest;
import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.dto.response.JwtResponse;
import com.formcraft.service.AuthService;
import com.formcraft.service.RefreshTokenService;
import com.formcraft.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;
    
    @MockitoBean
    private RefreshTokenService refreshTokenService;
    
    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;
    
    @MockitoBean
    private UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void login_ShouldReturn200() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("testuser");
        request.setPassword("password");

        JwtResponse response = new JwtResponse();
        response.setAccessToken("token");

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("token"));
    }

    @Test
    void register_ShouldReturn200() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setFullName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("Password123!");

        when(authService.register(any(RegisterRequest.class))).thenReturn("User registered successfully");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    void verifyRegistration_ShouldReturn200() throws Exception {
        JwtResponse response = new JwtResponse();
        response.setAccessToken("token");

        when(authService.verifyRegistrationOtp(anyString(), anyString())).thenReturn(response);

        mockMvc.perform(post("/api/auth/verify-registration")
                .param("email", "test@example.com")
                .param("otp", "123456")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("token"));
    }

    @Test
    void forgotPassword_ShouldReturn200() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                .param("identity", "testuser")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Request complete"));
    }

    @Test
    void resetPassword_ShouldReturn200() throws Exception {
        JwtResponse response = new JwtResponse();
        response.setAccessToken("token");

        when(authService.resetPasswordWithOtp(anyString(), anyString(), anyString())).thenReturn(response);

        mockMvc.perform(post("/api/auth/reset-password")
                .param("identity", "testuser")
                .param("otp", "123456")
                .param("newPassword", "NewPass1!")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("token"));
    }
}
