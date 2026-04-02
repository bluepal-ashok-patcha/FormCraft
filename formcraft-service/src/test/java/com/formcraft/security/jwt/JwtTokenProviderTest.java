package com.formcraft.security.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private Authentication authentication;

    private String secret = "YTIzNjQ4Yjk3YjZiNGJkYmE2YmY0YmRkYmU5NjY5YzYyYzM0ZTU2Nzc4ODk5YWFhYmNjY2RkZGVlZmZm"; // Long enough Base64 for HS256

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", secret);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationDate", 3600000L);
    }

    @Test
    void generateToken_ShouldReturnValidToken() {
        // Arrange
        when(authentication.getName()).thenReturn("testuser");

        // Act
        String token = jwtTokenProvider.generateToken(authentication);

        // Assert
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("testuser", jwtTokenProvider.getUsername(token));
    }

    @Test
    void validateToken_ShouldReturnFalse_WhenExpired() {
        // Arrange
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationDate", -100L);
        when(authentication.getName()).thenReturn("testuser");
        String token = jwtTokenProvider.generateToken(authentication);

        // Act
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void validateToken_ShouldReturnFalse_WhenSignatureIsInvalid() {
        // Arrange
        when(authentication.getName()).thenReturn("testuser");
        String token = jwtTokenProvider.generateToken(authentication);
        String invalidToken = token + "wrong";

        // Act
        boolean isValid = jwtTokenProvider.validateToken(invalidToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void validateToken_ShouldReturnFalse_WhenMalformed() {
        // Act
        boolean isValid = jwtTokenProvider.validateToken("not-a-token");

        // Assert
        assertFalse(isValid);
    }
}
