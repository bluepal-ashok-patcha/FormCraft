package com.formcraft.controller;
 
import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.BaseIntegrationTest;
import com.formcraft.dto.request.FormRequest;
import com.formcraft.dto.request.SubmissionRequest;
import com.formcraft.repository.FormRepository;
import com.formcraft.repository.FormResponseRepository;
import com.formcraft.service.CloudinaryService;
import com.formcraft.service.GeminiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
 
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
 
@AutoConfigureMockMvc
class FormControllerIntegrationTest extends BaseIntegrationTest {
 
    @Autowired
    private MockMvc mockMvc;
 
    @Autowired
    private FormRepository formRepository;
 
    @Autowired
    private FormResponseRepository formResponseRepository;
 
    @Autowired
    private ObjectMapper objectMapper;
 
    @MockitoBean
    private GeminiService geminiService;
 
    @MockitoBean
    private CloudinaryService cloudinaryService;
 
    @BeforeEach
    void cleanUp() {
        formResponseRepository.deleteAll();
        formRepository.deleteAll();
    }
 
    @Test
    @WithMockUser(roles = "ADMIN")
    void createForm_ShouldPersistInDatabase() throws Exception {
        FormRequest request = new FormRequest();
        request.setName("Integration Audit Form");
        Map<String, Object> schema = new HashMap<>();
        schema.put("fields", Collections.singletonList(Map.of("id", "f1", "type", "text", "label", "Full Name")));
        request.setSchema(schema);
 
        mockMvc.perform(post("/api/forms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Integration Audit Form")));
 
        // Registry Verification: Verify that the form asset was actually stored in the Postgres registry
        assertEquals(1, formRepository.count());
        assertTrue(formRepository.findAll().get(0).getSlug().contains("integration-audit-form"));
    }
 
    @Test
    @WithMockUser(roles = "ADMIN")
    void submitResponse_ShouldPersistTelemetryChain() throws Exception {
        // First, seed a form into the high-fidelity database using REST protocol
        FormRequest fr = new FormRequest();
        fr.setName("Submission Form");
        fr.setSchema(new HashMap<>());
        
        mockMvc.perform(post("/api/forms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(fr)))
                .andExpect(status().isCreated());
        
        UUID formId = formRepository.findAll().get(0).getId();
 
        SubmissionRequest sr = new SubmissionRequest();
        sr.setFormId(formId);
        sr.setResponses(Map.of("q1", "Integration works!"));
 
        mockMvc.perform(post("/api/forms/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sr)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));
 
        // Registry Verification: Verify that the telemetry response was captured and correctly mapped
        assertEquals(1, formResponseRepository.count());
        assertEquals("Integration works!", formResponseRepository.findAll().get(0).getResponseData().get("q1"));
    }
 
    @Test
    @WithMockUser(roles = "ADMIN")
    void getFormBySlug_ShouldRetrieveFromRegistry() throws Exception {
        FormRequest fr = new FormRequest();
        fr.setName("Lookup Form");
        fr.setSchema(new HashMap<>());
        
        mockMvc.perform(post("/api/forms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(fr)))
                .andExpect(status().isCreated());
                
        String slug = formRepository.findAll().get(0).getSlug();
 
        mockMvc.perform(get("/api/forms/s/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("Lookup Form")));
    }
}
