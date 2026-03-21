package com.formcraft.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.BaseIntegrationTest;
import com.formcraft.dto.request.LoginRequest;
import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.entity.Role;
import com.formcraft.entity.User;
import com.formcraft.repository.RoleRepository;
import com.formcraft.repository.UserRepository;
import com.formcraft.repository.RefreshTokenRepository;
import com.formcraft.service.EmailService;
import com.formcraft.util.RoleName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
        doNothing().when(emailService).sendOtpEmail(anyString(), anyString());
    }

    @Test
    void registerUser_ShouldCreateIdentityInRegistry() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("password123");
        request.setFullName("New User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registration successful! Please check your email for the OTP."));
    }

    @Test
    void registerDuplicateEmail_ShouldTriggerConflictRefusal() throws Exception {
        User user = User.builder()
                .username("existing")
                .fullName("Existing User")
                .email("duplicate@example.com")
                .password(passwordEncoder.encode("password"))
                .isActive(true)
                .build();
        userRepository.saveAndFlush(user);

        RegisterRequest request = new RegisterRequest();
        request.setUsername("different");
        request.setEmail("duplicate@example.com");
        request.setPassword("password");
        request.setFullName("Different User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("Error: Email already exists."));
    }

    @Test
    void login_WithValidCredentials_ShouldInitiateSecurityLink() throws Exception {
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName(RoleName.ROLE_ADMIN);
                    return roleRepository.save(r);
                });

        User user = User.builder()
                .username("testuser")
                .fullName("Test User")
                .email("test@example.com")
                .password(passwordEncoder.encode("password"))
                .isActive(true)
                .roles(Collections.singleton(adminRole))
                .build();
        userRepository.saveAndFlush(user);

        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("testuser");
        request.setPassword("password");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }
}
