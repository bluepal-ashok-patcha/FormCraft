package com.formcraft.controller;
 
import com.fasterxml.jackson.databind.ObjectMapper;
import com.formcraft.BaseIntegrationTest;
import com.formcraft.dto.CategoryDTO;
import com.formcraft.dto.TemplateDTO;
import com.formcraft.repository.CategoryRepository;
import com.formcraft.repository.TemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
 
import java.util.HashMap;
import java.util.UUID;
 
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
 
@AutoConfigureMockMvc
class TemplateControllerIntegrationTest extends BaseIntegrationTest {
 
    @Autowired
    private MockMvc mockMvc;
 
    @Autowired
    private TemplateRepository templateRepository;
 
    @Autowired
    private CategoryRepository categoryRepository;
 
    @Autowired
    private ObjectMapper objectMapper;
 
    @BeforeEach
    void cleanUp() {
        templateRepository.deleteAll();
        categoryRepository.deleteAll();
    }
 
    @Test
    @WithMockUser(roles = "ADMIN")
    void createCategory_ShouldPersistInRegistry() throws Exception {
        CategoryDTO dto = CategoryDTO.builder()
                .name("General Blueprint")
                .label("Enterprise Standard")
                .build();
 
        mockMvc.perform(post("/api/templates/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("GENERAL_BLUEPRINT")));
 
        assertEquals(1, categoryRepository.count());
    }
 
    @Test
    @WithMockUser(roles = "ADMIN")
    void createTemplate_ShouldMapToRegistry() throws Exception {
        TemplateDTO dto = TemplateDTO.builder()
                .name("Basic Feedback")
                .description("Simple feedback blueprint")
                .schema(new HashMap<>())
                .build();
 
        mockMvc.perform(post("/api/templates")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
 
        assertEquals(1, templateRepository.count());
        assertTrue(templateRepository.findAll().get(0).getName().equals("Basic Feedback"));
    }
 
    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteTemplate_ShouldPurgeFromRegistry() throws Exception {
        TemplateDTO dto = TemplateDTO.builder().name("To Purge").schema(new HashMap<>()).build();
        mockMvc.perform(post("/api/templates").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
        UUID id = templateRepository.findAll().get(0).getId();
 
        mockMvc.perform(delete("/api/templates/" + id))
                .andExpect(status().isOk());
 
        assertEquals(0, templateRepository.count());
    }
 
    @Test
    @WithMockUser(roles = {"ADMIN", "SUPER_ADMIN"}) 
    void promoteToGlobal_WithSuperAdmin_ShouldSucceed() throws Exception {
        TemplateDTO dto = TemplateDTO.builder().name("Promotable").schema(new HashMap<>()).build();
        mockMvc.perform(post("/api/templates").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
        UUID id = templateRepository.findAll().get(0).getId();
 
        mockMvc.perform(post("/api/templates/" + id + "/promote"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.global", is(true)));
    }
}
