package com.formcraft.controller;
 
import com.formcraft.BaseIntegrationTest;
import com.formcraft.service.CloudinaryService;
import com.formcraft.service.GeminiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
 
@AutoConfigureMockMvc
class ImageControllerIntegrationTest extends BaseIntegrationTest {
 
    @Autowired
    private MockMvc mockMvc;
 
    // Absolute Cloud & AI Isolation Registry
    @MockitoBean
    private CloudinaryService cloudinaryService;
 
    @MockitoBean
    private GeminiService geminiService;
 
    @Test
    @WithMockUser(roles = "ADMIN")
    void uploadImage_ShouldReturnCloudUrl() throws Exception {
        // High-Fidelity Signal Sync: CloudinaryService returns String (URL)
        when(cloudinaryService.uploadFile(any())).thenReturn("https://res.cloudinary.com/formcraft/image/v1/test.png");
 
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.png", MediaType.IMAGE_PNG_VALUE, "fake-image-bytes".getBytes());
 
        mockMvc.perform(multipart("/api/images/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                // Recalibrated to match Map pulse and Visual Asset message
                .andExpect(jsonPath("$.data.url", is("https://res.cloudinary.com/formcraft/image/v1/test.png")))
                .andExpect(jsonPath("$.message", containsString("Visual asset successfully synchronized")));
    }
 
    @Test
    @WithMockUser(roles = "ADMIN")
    void uploadImage_WhenServiceRejection_ShouldMapToConflictRefusal() throws Exception {
        // Business Logic Refusal Sync
        when(cloudinaryService.uploadFile(any())).thenThrow(new com.formcraft.exception.BusinessLogicException("Neural Asset Rejection: Image limit exceeded."));
 
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.png", MediaType.IMAGE_PNG_VALUE, "fake-image-bytes".getBytes());
 
        mockMvc.perform(multipart("/api/images/upload").file(file))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Image limit exceeded")));
    }
}
