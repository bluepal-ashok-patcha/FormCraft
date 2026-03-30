package com.formcraft.service.impl;

import com.formcraft.dto.request.LoginRequest;
import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.dto.response.JwtResponse;
import com.formcraft.entity.RefreshToken;
import com.formcraft.entity.Role;
import com.formcraft.entity.User;
import com.formcraft.exception.BusinessLogicException;
import com.formcraft.repository.RoleRepository;
import com.formcraft.repository.UserRepository;
import com.formcraft.security.jwt.JwtTokenProvider;
import com.formcraft.service.RefreshTokenService;
import com.formcraft.service.EmailService;
import com.formcraft.util.RoleName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .isActive(true)
                .roles(Collections.emptySet())
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password");
        registerRequest.setFullName("Test User");

        loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmail("testuser");
        loginRequest.setPassword("password");
    }

    @Test
    void register_Success() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(roleRepository.findByName(RoleName.ROLE_ADMIN)).thenReturn(Optional.of(new Role()));

        String result = authService.register(registerRequest);

        assertEquals("Registration successful! Please check your email for the OTP.", result);
        verify(userRepository, times(1)).save(any(User.class));
        verify(emailService, times(1)).sendVerificationEmail(anyString(), anyString());
    }

    @Test
    void register_UsernameAlreadyExists_ThrowsBusinessLogicException() {
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        BusinessLogicException exception = assertThrows(BusinessLogicException.class, 
                () -> authService.register(registerRequest));

        assertTrue(exception.getMessage().contains("Username already exists."));
    }

    @Test
    void register_EmailAlreadyExists_ThrowsBusinessLogicException() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        BusinessLogicException exception = assertThrows(BusinessLogicException.class, 
                () -> authService.register(registerRequest));

        assertTrue(exception.getMessage().contains("Email already exists."));
    }

    @Test
    void login_Success() {
        Authentication auth = mock(Authentication.class);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh_token");

        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtTokenProvider.generateToken(any(Authentication.class))).thenReturn("access_token");
        when(refreshTokenService.createRefreshToken(anyString())).thenReturn(refreshToken);

        JwtResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        assertEquals("refresh_token", response.getRefreshToken());
    }

    @Test
    void login_AccountNotActive_ThrowsBusinessLogicException() {
        testUser.setActive(false);
        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.of(testUser));

        BusinessLogicException exception = assertThrows(BusinessLogicException.class, 
                () -> authService.login(loginRequest));

        assertTrue(exception.getMessage().contains("Your account is not active."));
    }
}
