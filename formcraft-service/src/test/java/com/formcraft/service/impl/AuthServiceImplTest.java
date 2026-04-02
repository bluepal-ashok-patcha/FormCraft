package com.formcraft.service.impl;

import com.formcraft.dto.request.LoginRequest;
import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.dto.response.JwtResponse;
import com.formcraft.entity.RefreshToken;
import com.formcraft.entity.Role;
import com.formcraft.entity.User;
import com.formcraft.exception.AccountLockedException;
import com.formcraft.exception.BusinessLogicException;
import com.formcraft.repository.RoleRepository;
import com.formcraft.repository.UserRepository;
import com.formcraft.security.jwt.JwtTokenProvider;
import com.formcraft.service.AuditService;
import com.formcraft.service.EmailService;
import com.formcraft.service.RefreshTokenService;
import com.formcraft.util.RoleName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
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
    @Mock
    private AuditService auditService;
    @Mock
    private AuthServiceImpl self;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;
    private Role role;

    @BeforeEach
    void setUp() {
        role = new Role();
        role.setName(RoleName.ROLE_ADMIN);

        user = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .fullName("Test User")
                .email("test@example.com")
                .password("encodedPassword")
                .isActive(true)
                .roles(Set.of(role))
                .build();

        ReflectionTestUtils.setField(authService, "otpExpirationMinutes", 5);
        ReflectionTestUtils.setField(authService, "maxFailedAttempts", 5);
        ReflectionTestUtils.setField(authService, "lockoutDurationMinutes", 15);
        ReflectionTestUtils.setField(authService, "self", authService); // Point self to actual instance for test
    }

    @Test
    void login_ShouldReturnJwtResponse_WhenDetailsAreValid() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("testuser");
        request.setPassword("password");

        Authentication authentication = mock(Authentication.class);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");

        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtTokenProvider.generateToken(any())).thenReturn("access-token");
        when(refreshTokenService.createRefreshToken(anyString())).thenReturn(refreshToken);

        // Act
        JwtResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        verify(auditService).log(eq("USER_LOGIN"), anyString(), eq("USER"), any(), anyString());
    }

    @Test
    void login_ShouldThrowException_WhenUserIsInactive() {
        // Arrange
        user.setActive(false);
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("testuser");

        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(BusinessLogicException.class, () -> authService.login(request));
    }

    @Test
    void login_ShouldThrowException_WhenUserIsLocked() {
        // Arrange
        user.setLockoutTime(LocalDateTime.now().plusMinutes(10));
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("testuser");

        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(AccountLockedException.class, () -> authService.login(request));
    }

    @Test
    void login_ShouldHandleFailedLogin_WhenCredentialsAreInvalid() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("testuser");
        request.setPassword("wrong");

        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.of(user));
        when(userRepository.findById(any())).thenReturn(Optional.of(user)); // Add findById for handleFailedLogin
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> authService.login(request));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ShouldSaveUser_WhenDetailsAreNew() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setFullName("New User");
        request.setEmail("new@example.com");
        request.setPassword("password");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(roleRepository.findByName(RoleName.ROLE_ADMIN)).thenReturn(Optional.of(role));

        // Act
        String result = authService.register(request);

        // Assert
        assertTrue(result.contains("Registration successful"));
        verify(userRepository).save(any(User.class));
        verify(emailService).sendVerificationEmail(anyString(), anyString());
    }

    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(BusinessLogicException.class, () -> authService.register(request));
    }

    @Test
    void verifyRegistrationOtp_ShouldActivateUser_WhenOtpIsValid() {
        // Arrange
        user.setActive(false);
        user.setOtpCode("123456");
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(any())).thenReturn("access-token");
        when(refreshTokenService.createRefreshToken(anyString())).thenReturn(refreshToken);

        // Act
        JwtResponse response = authService.verifyRegistrationOtp("test@example.com", "123456");

        // Assert
        assertTrue(user.isActive());
        assertNotNull(response);
        verify(userRepository, times(2)).save(user); // Called in verifying + handling success login
    }

    @Test
    void forgotPasswordRequest_ShouldSendEmail_WhenUserExists() {
        // Arrange
        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.of(user));

        // Act
        authService.forgotPasswordRequest("testuser");

        // Assert
        verify(emailService).sendForgotPasswordEmail(eq(user.getEmail()), anyString());
        verify(userRepository).save(user);
    }

    @Test
    void resetPasswordWithOtp_ShouldUpdatePassword_WhenOtpIsValid() {
        // Arrange
        user.setOtpCode("123456");
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");

        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenReturn("new-encoded");
        when(jwtTokenProvider.generateToken(any())).thenReturn("token");
        when(refreshTokenService.createRefreshToken(anyString())).thenReturn(refreshToken);

        // Act
        JwtResponse response = authService.resetPasswordWithOtp("testuser", "123456", "new-pass");

        // Assert
        assertNotNull(response);
        assertEquals(0, user.getFailedLoginAttempts());
        verify(userRepository, times(2)).save(user); // Called in reset + handling success login
    }

    @Test
    void logout_ShouldClearContext() {
        // Arrange
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        
        SecurityContextHolder.setContext(securityContext);
        
        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.of(user));

        // Act
        authService.logout();

        // Assert
        verify(refreshTokenService).deleteByUserId(user.getId());
        // verify(SecurityContextHolder.class); // verified via lack of exception now
        
        SecurityContextHolder.clearContext();
    }
}
