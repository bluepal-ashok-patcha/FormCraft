package com.formcraft.service;

import com.formcraft.dto.response.DashboardStatsResponse;
import com.formcraft.entity.Form;
import com.formcraft.entity.FormResponse;
import com.formcraft.repository.FormRepository;
import com.formcraft.repository.FormResponseRepository;
import com.formcraft.repository.TemplateRepository;
import com.formcraft.repository.builder.FormDraftRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.BDDMockito.doReturn;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private FormRepository formRepository;

    @Mock
    private FormResponseRepository formResponseRepository;

    @Mock
    private FormDraftRepository formDraftRepository;

    @Mock
    private TemplateRepository templateRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
    }

    @Test
    void getDashboardStats_AsSuperAdmin_ShouldReturnGlobalMetrics() {
        // Setup Super Admin Roles
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN")))
                .when(authentication).getAuthorities();

        // Seed Mocks for counts
        when(formRepository.count()).thenReturn(10L);
        when(formDraftRepository.count()).thenReturn(5L);
        when(formRepository.countByStatus(any())).thenReturn(8L);
        when(templateRepository.countByGlobal(true)).thenReturn(3L);
        when(formRepository.findTop5ByOrderByCreatedAtDesc()).thenReturn(Collections.emptyList());
        when(formResponseRepository.findTop5ByOrderByCreatedAtDesc()).thenReturn(Collections.emptyList());
        when(formResponseRepository.findGlobalResponseStats(any())).thenReturn(Collections.emptyList());

        DashboardStatsResponse stats = dashboardService.getDashboardStats("30d");

        assertNotNull(stats);
        assertEquals(10, stats.getTotalForms());
        assertEquals(3, stats.getTotalTemplates());
    }

    @Test
    void getDashboardStats_AsRegularUser_ShouldReturnPersonalMetrics() {
        // Setup User Roles
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .when(authentication).getAuthorities();

        // Seed Mocks for personal counts
        when(formRepository.countByCreatedBy("testuser")).thenReturn(5L);
        when(formDraftRepository.countByCreatedBy("testuser")).thenReturn(2L);
        when(formRepository.countByCreatedByAndStatus(eq("testuser"), any())).thenReturn(4L);
        
        // Mock range specifics
        when(formResponseRepository.findResponseStatsByCreatedBy(eq("testuser"), any())).thenReturn(Collections.emptyList());
        when(formRepository.findTop5ByCreatedByOrderByCreatedAtDesc(anyString())).thenReturn(Collections.emptyList());
        when(formResponseRepository.findTop5ByFormCreatedByOrderByCreatedAtDesc(anyString())).thenReturn(Collections.emptyList());

        DashboardStatsResponse stats = dashboardService.getDashboardStats("7d");

        assertNotNull(stats);
        assertEquals(5, stats.getTotalForms());
        assertEquals(0, stats.getTotalTemplates()); // Non-admin sees 0 templates in stats
    }

    @Test
    void getDashboardStats_WithActivities_ShouldCorrelateTimeline() {
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .when(authentication).getAuthorities();

        Form testForm = new Form();
        testForm.setId(UUID.randomUUID());
        testForm.setName("Protocol Alpha");
        testForm.setCreatedAt(LocalDateTime.now());

        FormResponse testResponse = new FormResponse();
        testResponse.setId(UUID.randomUUID());
        testResponse.setForm(testForm);
        testResponse.setCreatedAt(LocalDateTime.now().minusMinutes(10));

        when(formRepository.findTop5ByCreatedByOrderByCreatedAtDesc(anyString())).thenReturn(List.of(testForm));
        when(formResponseRepository.findTop5ByFormCreatedByOrderByCreatedAtDesc(anyString())).thenReturn(List.of(testResponse));
        
        // Mock basics to avoid NPE
        when(formRepository.countByCreatedBy(anyString())).thenReturn(1L);
        when(formResponseRepository.findResponseStatsByCreatedBy(anyString(), any())).thenReturn(Collections.emptyList());

        DashboardStatsResponse stats = dashboardService.getDashboardStats("30d");

        assertNotNull(stats.getRecentActivity());
        assertTrue(stats.getRecentActivity().size() >= 2);
        // Verify sorting (Newest first)
        assertEquals("FORM_CREATED", stats.getRecentActivity().get(0).getType());
    }
}
