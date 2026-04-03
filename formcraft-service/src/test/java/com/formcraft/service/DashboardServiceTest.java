package com.formcraft.service;

import com.formcraft.dto.response.DashboardStatsResponse;
import com.formcraft.entity.Form;
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
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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

    @InjectMocks
    private DashboardService dashboardService;

    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        securityContext = mock(SecurityContext.class);
        authentication = mock(Authentication.class);
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
    }

    @Test
    void getDashboardStats_ShouldReturnGlobalStats_ForSuperAdmin() {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        when(formRepository.count()).thenReturn(10L);
        when(formDraftRepository.count()).thenReturn(5L);
        when(templateRepository.countByGlobal(true)).thenReturn(2L);
        
        List<Object[]> stats = Arrays.asList(new Object[][]{{"2024-01-01", 5L}});
        when(formResponseRepository.findGlobalResponseStats(any())).thenReturn(stats);

        // Act
        DashboardStatsResponse statsResponse = dashboardService.getDashboardStats("7d");

        // Assert
        assertNotNull(statsResponse);
        assertEquals(10L, statsResponse.getTotalForms());
        assertEquals(2L, statsResponse.getTotalTemplates());
        assertFalse(statsResponse.getChartData().isEmpty());
    }

    @Test
    void getDashboardStats_ShouldReturnUserStats_ForRegularAdmin() {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        when(formRepository.countByCreatedBy("testuser")).thenReturn(5L);
        when(formResponseRepository.countByFormCreatedBy("testuser")).thenReturn(20L);
        
        List<Object[]> stats = Arrays.asList(new Object[][]{{"2024-01-01", 20L}});
        when(formResponseRepository.findResponseStatsByCreatedBy(eq("testuser"), any())).thenReturn(stats);

        // Act
        DashboardStatsResponse statsResponse = dashboardService.getDashboardStats("30d");

        // Assert
        assertNotNull(statsResponse);
        assertEquals(5L, statsResponse.getTotalForms());
        assertEquals(4.0, statsResponse.getAvgResponsesPerForm());
    }

    @Test
    void getDashboardStats_ShouldHandleExpiringForms() {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        Form expiringForm = new Form();
        expiringForm.setId(UUID.randomUUID());
        expiringForm.setName("Expiring Form");
        expiringForm.setExpiresAt(LocalDateTime.now().plusHours(10));
        expiringForm.setCreatedAt(LocalDateTime.now().minusDays(1));

        when(formRepository.findAllByCreatedByAndExpiresAtBetweenOrderByExpiresAtAsc(anyString(), any(), any()))
                .thenReturn(List.of(expiringForm));

        // Act
        DashboardStatsResponse statsResponse = dashboardService.getDashboardStats("7d");

        // Assert
        assertFalse(statsResponse.getExpiringForms().isEmpty());
        assertEquals("Expiring Form", statsResponse.getExpiringForms().get(0).getName());
        assertTrue(statsResponse.getExpiringForms().get(0).getTimeLeft().contains("h"));
    }

    @Test
    void getDashboardStats_ShouldDefaultTo7Days_WhenRangeIsInvalid() {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        // Act
        dashboardService.getDashboardStats("unknown");

        // Assert
        verify(formResponseRepository).findResponseStatsByCreatedBy(eq("testuser"), any());
    }
}
