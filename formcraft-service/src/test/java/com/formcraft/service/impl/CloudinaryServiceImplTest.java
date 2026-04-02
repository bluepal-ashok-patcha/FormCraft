package com.formcraft.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceImplTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @Mock
    private MultipartFile file;

    @InjectMocks
    private CloudinaryServiceImpl cloudinaryService;

    @BeforeEach
    void setUp() {
        // cloudinary.uploader() is called in each method, mocking it here
    }

    @Test
    void uploadFile_ShouldReturnUrl_WhenSuccessful() throws IOException {
        // Arrange
        byte[] bytes = "test content".getBytes();
        String expectedUrl = "https://cloudinary.com/test.png";
        Map<String, Object> result = Map.of("secure_url", expectedUrl);

        when(file.getBytes()).thenReturn(bytes);
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(eq(bytes), any(Map.class))).thenReturn(result);

        // Act
        String actualUrl = cloudinaryService.uploadFile(file);

        // Assert
        assertEquals(expectedUrl, actualUrl);
        verify(uploader, times(1)).upload(eq(bytes), any(Map.class));
    }

    @Test
    void uploadFile_ShouldThrowException_WhenIOExceptionOccurs() throws IOException {
        // Arrange
        when(file.getBytes()).thenThrow(new IOException("Disk Error"));

        // Act & Assert
        com.formcraft.exception.BusinessLogicException exception = assertThrows(
            com.formcraft.exception.BusinessLogicException.class,
            () -> cloudinaryService.uploadFile(file)
        );

        assertTrue(exception.getMessage().contains("Visual Protocol Interruption"));
    }
}
