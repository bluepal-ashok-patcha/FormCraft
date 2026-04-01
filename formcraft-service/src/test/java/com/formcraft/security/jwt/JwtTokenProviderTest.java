package com.formcraft.security.jwt;
 
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;
 
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
 
@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {
 
    private JwtTokenProvider jwtTokenProvider;
 
    @Mock
    private Authentication authentication;
 
    private final String secret = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
 
    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", secret);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationDate", 3600000L);
    }
 
    @Test
    void generateToken_Success() {
        when(authentication.getName()).thenReturn("testuser");
        String token = jwtTokenProvider.generateToken(authentication);
 
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }
 
    @Test
    void getUsername_FromValidToken_Success() {
        when(authentication.getName()).thenReturn("testuser");
        String token = jwtTokenProvider.generateToken(authentication);
 
        String username = jwtTokenProvider.getUsername(token);
 
        assertEquals("testuser", username);
    }
 
    @Test
    void validateToken_ValidToken_ReturnsTrue() {
        when(authentication.getName()).thenReturn("testuser");
        String token = jwtTokenProvider.generateToken(authentication);

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    void validateToken_InvalidSignature_ReturnsFalse() {
        when(authentication.getName()).thenReturn("testuser");
        String token = jwtTokenProvider.generateToken(authentication);
        String tamperedToken = token + "xyz"; // Tampering with the signature

        boolean isValid = jwtTokenProvider.validateToken(tamperedToken);

        assertFalse(isValid);
    }

    @Test
    void validateToken_MalformedToken_ReturnsFalse() {
        boolean isValid = jwtTokenProvider.validateToken("not-a-jwt-token");
        assertFalse(isValid);
    }

    @Test
    void validateToken_ExpiredToken_ReturnsFalse() {
        // High-Fidelity Expiration Test: Recalibrating time frame to negative space
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationDate", -1000L);
        when(authentication.getName()).thenReturn("testuser");
        String token = jwtTokenProvider.generateToken(authentication);

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertFalse(isValid);
    }
}
