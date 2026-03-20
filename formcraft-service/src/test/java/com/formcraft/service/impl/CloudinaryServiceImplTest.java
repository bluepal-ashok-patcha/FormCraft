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
import java.util.HashMap;
import java.util.Map;
 
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.*;
 
@ExtendWith(MockitoExtension.class)
class CloudinaryServiceImplTest {
 
    @Mock
    private Cloudinary cloudinary;
 
    @Mock
    private Uploader uploader;
 
    @Mock
    private MultipartFile multipartFile;
 
    @InjectMocks
    private CloudinaryServiceImpl cloudinaryService;
 
    @BeforeEach
    void setUp() {
        when(cloudinary.uploader()).thenReturn(uploader);
    }
 
    @Test
    void uploadFile_Success_ReturnsSecureUrl() throws IOException {
        byte[] bytes = "test image content".getBytes();
        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/test/image.png");
 
        when(multipartFile.getBytes()).thenReturn(bytes);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);
 
        String result = cloudinaryService.uploadFile(multipartFile);
 
        assertEquals("https://res.cloudinary.com/test/image.png", result);
        verify(uploader, times(1)).upload(eq(bytes), anyMap());
    }
 
    @Test
    void uploadFile_IOException_ThrowsBusinessLogicException() throws IOException {
        when(multipartFile.getBytes()).thenThrow(new IOException("Disk link failure"));
 
        BusinessLogicException exception = assertThrows(BusinessLogicException.class, () -> {
            cloudinaryService.uploadFile(multipartFile);
        });
 
        assertTrue(exception.getMessage().contains("Visual Protocol Interruption"));
    }
}
