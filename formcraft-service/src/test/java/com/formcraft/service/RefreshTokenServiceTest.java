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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
 
@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {
 
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
 
    @Mock
    private UserRepository userRepository;
 
    @InjectMocks
    private RefreshTokenService refreshTokenService;
 
    private User user;
    private RefreshToken refreshToken;
    private long expirationMs = 3600000; // 1 hour
 
    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenDurationMs", expirationMs);
 
        user = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .build();
 
        // Structural Registry Sync: Uses standard instantiation as @Builder is unavailable
        refreshToken = new RefreshToken();
        refreshToken.setId(1L);
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(expirationMs));
    }
 
    @Test
    void createRefreshToken_ShouldPersistNewIdentityInRegistry() {
        when(userRepository.findByUsernameOrEmail("testuser", "testuser")).thenReturn(Optional.of(user));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(refreshToken);
 
        RefreshToken result = refreshTokenService.createRefreshToken("testuser");
 
        assertNotNull(result);
        assertEquals("testuser", result.getUser().getUsername());
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }
 
    @Test
    void verifyExpiration_ValidToken_ShouldPassCircuit() {
        RefreshToken result = refreshTokenService.verifyExpiration(refreshToken);
        assertEquals(refreshToken, result);
    }
 
    @Test
    void verifyExpiration_ExpiredToken_ShouldTriggerRefusal() {
        refreshToken.setExpiryDate(Instant.now().minusMillis(1000));
 
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            refreshTokenService.verifyExpiration(refreshToken);
        });
 
        assertTrue(exception.getMessage().contains("expired"));
        verify(refreshTokenRepository, times(1)).delete(refreshToken);
    }
 
    @Test
    void deleteByUserId_ShouldPurgeFromRegistry() {
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(refreshTokenRepository.deleteByUser(user)).thenReturn(1);
 
        int result = refreshTokenService.deleteByUserId(user.getId());
 
        assertEquals(1, result);
        verify(refreshTokenRepository, times(1)).deleteByUser(user);
    }
}
