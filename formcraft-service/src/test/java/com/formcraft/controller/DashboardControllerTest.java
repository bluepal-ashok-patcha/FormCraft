package com.formcraft.controller;

import com.formcraft.dto.response.DashboardStatsResponse;
import com.formcraft.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

    @MockitoBean
    private com.formcraft.security.jwt.JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser
    void getStats_ShouldReturn200() throws Exception {
        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalForms(10L)
                .activeForms(50L)
                .build();

        when(dashboardService.getDashboardStats("7d")).thenReturn(stats);

        mockMvc.perform(get("/api/dashboard/stats").param("range", "7d"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalForms").value(10))
                .andExpect(jsonPath("$.data.activeForms").value(50));
    }
}
