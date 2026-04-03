package com.formcraft.service;

import com.formcraft.entity.RefreshToken;
import com.formcraft.entity.User;
import com.formcraft.exception.BadRequestException;
import com.formcraft.repository.RefreshTokenRepository;
import com.formcraft.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenDurationMs", 3600000L);
    }

    @Test
    void createRefreshToken_ShouldReturnToken_WhenUserExists() {
        // Arrange
        String username = "testuser";
        User user = new User();
        user.setUsername(username);
        
        when(userRepository.findByUsernameOrEmail(username, username)).thenReturn(Optional.of(user));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        RefreshToken token = refreshTokenService.createRefreshToken(username);

        // Assert
        assertNotNull(token);
        assertEquals(user, token.getUser());
        assertNotNull(token.getToken());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void createRefreshToken_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(BadRequestException.class, () -> refreshTokenService.createRefreshToken("none"));
    }

    @Test
    void verifyExpiration_ShouldReturnToken_WhenValid() {
        // Arrange
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(Instant.now().plusSeconds(60));

        // Act
        RefreshToken result = refreshTokenService.verifyExpiration(token);

        // Assert
        assertEquals(token, result);
    }

    @Test
    void verifyExpiration_ShouldThrowException_WhenExpired() {
        // Arrange
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(Instant.now().minusSeconds(60));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> refreshTokenService.verifyExpiration(token));
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void deleteByUserId_ShouldDelete_WhenUserExists() {
        // Arrange
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(refreshTokenRepository.deleteByUser(user)).thenReturn(1);

        // Act
        int result = refreshTokenService.deleteByUserId(userId);

        // Assert
        assertEquals(1, result);
        verify(refreshTokenRepository).deleteByUser(user);
    }
}
