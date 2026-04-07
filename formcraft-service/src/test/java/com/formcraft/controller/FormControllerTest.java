package com.formcraft.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.dto.request.FormRequest;
import com.formcraft.dto.request.SubmissionRequest;
import com.formcraft.dto.response.FormDto;
import com.formcraft.dto.response.ResponseDto;
import com.formcraft.service.FormService;
import com.formcraft.service.CloudinaryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FormController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for pure controller testing
class FormControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FormService formService;

    @MockitoBean
    private com.formcraft.security.jwt.JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CloudinaryService cloudinaryService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void createForm_ShouldReturn201() throws Exception {
        FormRequest request = new FormRequest();
        request.setName("Test Form");
        request.setSchema(Map.of("fields", List.of())); // Add mandatory schema
        
        FormDto response = FormDto.builder()
                .id(UUID.randomUUID())
                .name("Test Form")
                .build();

        when(formService.createForm(any(FormRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/forms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Test Form"));
    }

    @Test
    @WithMockUser
    void getFormById_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        FormDto response = FormDto.builder()
                .id(id)
                .name("Test Form")
                .build();

        when(formService.getFormById(id)).thenReturn(response);

        mockMvc.perform(get("/api/forms/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id.toString()));
    }

    @Test
    @WithMockUser
    void getAllForms_ShouldReturn200() throws Exception {
        FormDto formDto = FormDto.builder()
                .name("Test Form")
                .build();
        Page<FormDto> page = new PageImpl<>(List.of(formDto));

        when(formService.getAllForms(any(), any(), any(), any(), any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/forms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Test Form"));
    }

    @Test
    @WithMockUser
    void getFormAnalytics_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        Map<String, Object> analytics = Map.of("q1", Map.of("topAnswer", "Ans 1"));

        when(formService.getFormAnalytics(id)).thenReturn(analytics);

        mockMvc.perform(get("/api/forms/" + id + "/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.q1.topAnswer").value("Ans 1"));
    }

    @Test
    @WithMockUser
    void submitResponse_ShouldReturn201() throws Exception {
        SubmissionRequest request = new SubmissionRequest();
        request.setFormId(UUID.randomUUID());
        request.setResponses(Map.of("field1", "value1")); // Add mandatory responses
        
        ResponseDto response = ResponseDto.builder()
                .id(UUID.randomUUID())
                .build();

        when(formService.submitResponse(any(SubmissionRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/forms/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.data.id").exists());
    }

    @Test
    @WithMockUser
    void deleteForm_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/forms/" + id)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Form and all its responses deleted successfully"));
    }

    @Test
    @WithMockUser
    void exportResponses_ShouldReturnCsvFile() throws Exception {
        UUID id = UUID.randomUUID();
        when(formService.exportResponsesToCsv(eq(id), any(), any(), any())).thenReturn(new byte[]{1, 2, 3});

        mockMvc.perform(get("/api/forms/" + id + "/responses/export/csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"))
                .andExpect(content().bytes(new byte[]{1, 2, 3}));
    }

    @Test
    @WithMockUser
    void exportResponsesPdf_ShouldReturnPdfFile() throws Exception {
        UUID id = UUID.randomUUID();
        when(formService.exportResponsesToPdf(id)).thenReturn(new byte[]{1, 2, 3});

        mockMvc.perform(get("/api/forms/" + id + "/responses/export/pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(content().bytes(new byte[]{1, 2, 3}));
    }
}
