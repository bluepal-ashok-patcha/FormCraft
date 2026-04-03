package com.formcraft.controller;

import com.formcraft.dto.CategoryDTO;
import com.formcraft.dto.TemplateDTO;
import com.formcraft.service.TemplateService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TemplateController.class)
@AutoConfigureMockMvc(addFilters = false)
class TemplateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TemplateService templateService;

    @MockitoBean
    private com.formcraft.security.jwt.JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTemplate_ShouldReturn201() throws Exception {
        TemplateDTO dto = TemplateDTO.builder().name("New Template").build();
        when(templateService.createTemplate(any(TemplateDTO.class))).thenReturn(dto);

        mockMvc.perform(post("/api/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New Template\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("New Template"));
    }

    @Test
    void getAllVisibleTemplates_ShouldReturn200() throws Exception {
        when(templateService.getAllVisibleTemplates(null)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/templates"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "SUPER_ADMIN")
    void promoteToGlobal_ShouldReturn200() throws Exception {
       UUID id = UUID.randomUUID();
       TemplateDTO dto = TemplateDTO.builder().id(id).global(true).build();
       when(templateService.promoteToGlobal(id)).thenReturn(dto);

       mockMvc.perform(post("/api/templates/" + id + "/promote"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data.global").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCategory_ShouldReturn201() throws Exception {
        CategoryDTO dto = CategoryDTO.builder().id(1).name("IT").build();
        when(templateService.createCategory(any(CategoryDTO.class))).thenReturn(dto);

        mockMvc.perform(post("/api/templates/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"IT\", \"label\":\"InfoTech\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("IT"));
    }
}
