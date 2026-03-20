package com.formcraft.service.impl;
 
import com.formcraft.dto.request.LoginRequest;
import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.dto.response.JwtResponse;
import com.formcraft.entity.RefreshToken;
import com.formcraft.entity.Role;
import com.formcraft.entity.User;
import com.formcraft.exception.BusinessLogicException;
import com.formcraft.exception.ResourceNotFoundException;
import com.formcraft.repository.RoleRepository;
import com.formcraft.repository.UserRepository;
import com.formcraft.security.jwt.JwtTokenProvider;
import com.formcraft.service.RefreshTokenService;
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
 
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
 
    @InjectMocks
    private AuthServiceImpl authService;
 
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;
    private Role role;
 
    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setFullName("Test User");
        registerRequest.setPassword("password");
 
        loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmail("testuser");
        loginRequest.setPassword("password");
 
        role = new Role();
        role.setId(1L);
        role.setName(RoleName.ROLE_ADMIN);
 
        user = User.builder()
                .username("testuser")
                .email("test@example.com")
                .fullName("Test User")
                .password("encoded_password")
                .roles(Collections.singleton(role))
                .build();
    }
 
    @Test
    void register_Success() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_ADMIN)).thenReturn(Optional.of(role));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
 
        String result = authService.register(registerRequest);
 
        assertEquals("User registered successfully!", result);
        verify(userRepository, times(1)).save(any(User.class));
    }
 
    @Test
    void register_UsernameAlreadyExists_ThrowsBusinessLogicException() {
        when(userRepository.existsByUsername(anyString())).thenReturn(true);
 
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () -> {
            authService.register(registerRequest);
        });
 
        assertTrue(exception.getMessage().contains("username is already indexed"));
        verify(userRepository, never()).save(any(User.class));
    }
 
    @Test
    void register_EmailAlreadyExists_ThrowsBusinessLogicException() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(true);
 
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () -> {
            authService.register(registerRequest);
        });
 
        assertTrue(exception.getMessage().contains("email address is already registered"));
        verify(userRepository, never()).save(any(User.class));
    }
 
    @Test
    void register_RoleNotFound_ThrowsResourceNotFoundException() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_ADMIN)).thenReturn(Optional.empty());
 
        assertThrows(ResourceNotFoundException.class, () -> {
            authService.register(registerRequest);
        });
    }
 
    @Test
    void login_Success() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("testuser");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtTokenProvider.generateToken(authentication)).thenReturn("jwt_token");
        
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh_token");
        when(refreshTokenService.createRefreshToken("testuser")).thenReturn(refreshToken);
        
        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.of(user));
 
        JwtResponse response = authService.login(loginRequest);
 
        assertNotNull(response);
        assertEquals("jwt_token", response.getAccessToken());
        assertEquals("refresh_token", response.getRefreshToken());
        assertEquals("testuser", response.getUsername());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
