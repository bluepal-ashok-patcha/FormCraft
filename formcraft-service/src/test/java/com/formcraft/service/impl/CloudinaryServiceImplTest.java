package com.formcraft.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.formcraft.exception.BusinessLogicException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceImplTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private CloudinaryServiceImpl cloudinaryService;

    @BeforeEach
    void setUp() {
        when(cloudinary.uploader()).thenReturn(uploader);
    }

    @Test
    void uploadFile_ShouldReturnUrl_WhenUploadIsSuccessful() throws IOException {
        // Arrange
        MultipartFile file = mock(MultipartFile.class);
        byte[] bytes = new byte[]{1, 2, 3};
        when(file.getBytes()).thenReturn(bytes);

        Map<String, Object> mockResult = Map.of("secure_url", "https://cloudinary.com/image.jpg");
        when(uploader.upload(eq(bytes), any())).thenReturn(mockResult);

        // Act
        String result = cloudinaryService.uploadFile(file);

        // Assert
        assertEquals("https://cloudinary.com/image.jpg", result);
    }

    @Test
    void uploadFile_ShouldThrowException_WhenIOExceptionOccurs() throws IOException {
        // Arrange
        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenThrow(new IOException("Disk Failure"));

        // Act & Assert
        BusinessLogicException ex = assertThrows(BusinessLogicException.class, () -> 
            cloudinaryService.uploadFile(file));
        assertTrue(ex.getMessage().contains("Visual Protocol Interruption"));
    }
}
