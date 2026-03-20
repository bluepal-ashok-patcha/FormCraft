package com.formcraft.controller;
 
import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.BaseIntegrationTest;
import com.formcraft.dto.request.LoginRequest;
import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.entity.Role;
import com.formcraft.repository.RoleRepository;
import com.formcraft.repository.UserRepository;
import com.formcraft.repository.RefreshTokenRepository;
import com.formcraft.util.RoleName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
 
@AutoConfigureMockMvc
class AuthControllerIntegrationTest extends BaseIntegrationTest {
 
    @Autowired
    private MockMvc mockMvc;
 
    @Autowired
    private UserRepository userRepository;
 
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
 
    @Autowired
    private ObjectMapper objectMapper;
 
    @BeforeEach
    void seedAndReset() {
        // High-Fidelity Purge Pulse: Refresh tokens cleared before users
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
        
        // Authority Registry Sync
        if (roleRepository.findByName(RoleName.ROLE_ADMIN).isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName(RoleName.ROLE_ADMIN);
            roleRepository.save(adminRole);
        }
    }
 
    @Test
    void registerUser_ShouldCreateIdentityInRegistry() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser_reg");
        request.setPassword("password123");
        request.setFullName("Test User Registration");
        request.setEmail("test_reg@example.com");
 
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                // Recalibrated to match AuthController.java registration pulse
                .andExpect(jsonPath("$.message", is("Registration successful")));
 
        assertTrue(userRepository.existsByUsername("testuser_reg"));
    }
 
    @Test
    void login_WithValidCredentials_ShouldInitiateSecurityLink() throws Exception {
        // Seed identity
        RegisterRequest reg = new RegisterRequest();
        reg.setUsername("loginuser");
        reg.setPassword("secret123");
        reg.setFullName("Login User");
        reg.setEmail("login@example.com");
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(reg)));
 
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmail("loginuser");
        loginRequest.setPassword("secret123");
 
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.username", is("loginuser")));
    }
 
    @Test
    void registerDuplicateEmail_ShouldTriggerConflictRefusal() throws Exception {
        // Seed identity pulse
        RegisterRequest reg = new RegisterRequest();
        reg.setUsername("firstuser");
        reg.setPassword("secret123");
        reg.setFullName("First User");
        reg.setEmail("duplicate@example.com");
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(reg)));
 
        RegisterRequest dup = new RegisterRequest();
        dup.setUsername("seconduser");
        dup.setPassword("secret123");
        dup.setFullName("Second User");
        dup.setEmail("duplicate@example.com");
 
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dup)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("email address is already registered")));
    }
}
