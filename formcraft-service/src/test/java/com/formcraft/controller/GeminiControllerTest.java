package com.formcraft.controller;

import com.formcraft.service.GeminiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GeminiController.class)
@AutoConfigureMockMvc(addFilters = false)
class GeminiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GeminiService geminiService;

    @MockitoBean
    private com.formcraft.security.jwt.JwtTokenProvider jwtTokenProvider;

    @Test
    void generateRegex_ShouldReturn200() throws Exception {
        String mockResponse = "{\"regex\": \"abc\", \"errorMessage\": \"err\"}";
        when(geminiService.generateContent(anyString())).thenReturn(Mono.just(mockResponse));

        mockMvc.perform(post("/api/ai/generate-regex")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prompt\":\"test prompt\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.regex").value("abc"));
    }

    @Test
    void generateBlueprint_ShouldReturn200() throws Exception {
        String mockResponse = "[{\"id\": \"1\", \"label\": \"Name\"}]";
        when(geminiService.generateFormBlueprint(anyString(), any())).thenReturn(Mono.just(mockResponse));

        mockMvc.perform(post("/api/ai/generate-blueprint")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\":\"test desc\", \"currentFields\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].label").value("Name"));
    }

    @Test
    void recommendTheme_ShouldReturn200() throws Exception {
        String mockResponse = "{\"themeColor\": \"#000\", \"backgroundColor\": \"#fff\"}";
        when(geminiService.generateThemeBlueprint(anyString())).thenReturn(Mono.just(mockResponse));

        mockMvc.perform(post("/api/ai/recommend-theme")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"test title\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.themeColor").value("#000"));
    }

    @Test
    void generateRegex_MissingPrompt_ShouldReturn400() throws Exception {
        mockMvc.perform(post("/api/ai/generate-regex")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
