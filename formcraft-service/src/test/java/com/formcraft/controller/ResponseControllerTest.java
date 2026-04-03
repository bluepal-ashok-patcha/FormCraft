package com.formcraft.controller;

import com.formcraft.dto.response.ResponseDto;
import com.formcraft.service.FormService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ResponseController.class)
@AutoConfigureMockMvc(addFilters = false)
class ResponseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FormService formService;

    @MockitoBean
    private com.formcraft.security.jwt.JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteResponse_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        
        mockMvc.perform(delete("/api/responses/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Response deleted successfully"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateResponse_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        ResponseDto dto = ResponseDto.builder().id(id).build();
        when(formService.updateResponse(eq(id), any())).thenReturn(dto);

        mockMvc.perform(put("/api/responses/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"q1\":\"Ans\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id.toString()));
    }
}
