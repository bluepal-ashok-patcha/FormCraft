package com.formcraft.service;

import com.formcraft.dto.response.DashboardStatsResponse;
import com.formcraft.entity.Form;
import com.formcraft.repository.FormRepository;
import com.formcraft.repository.FormResponseRepository;
import com.formcraft.repository.TemplateRepository;
import com.formcraft.repository.builder.FormDraftRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Arrays;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.mockito.ArgumentCaptor;

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

    @ParameterizedTest
    @CsvSource({
        "unknown, 7",
        "7d, 7",
        "30d, 30",
        "90d, 90"
    })
    void getDashboardStats_ShouldVerifyCorrectRange(String range, int expectedDays) {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        // Act
        dashboardService.getDashboardStats(range);

        // Assert
        ArgumentCaptor<LocalDateTime> captor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(formResponseRepository).findResponseStatsByCreatedBy(eq("testuser"), captor.capture());
        
        // Success criteria: The start date should be roughly 'expectedDays' before now
        LocalDateTime capturedDate = captor.getValue();
        LocalDateTime expectedDate = LocalDateTime.now().minusDays(expectedDays);
        
        // Threshold check (allow 1 minute variance for test execution timing)
        assertTrue(capturedDate.isAfter(expectedDate.minusMinutes(1)) && 
                   capturedDate.isBefore(expectedDate.plusMinutes(1)));
    }

    @Test
    void fetchPromotionRequests_ShouldHandleSuperAdmin() {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        com.formcraft.entity.Template template = new com.formcraft.entity.Template();
        template.setId(UUID.randomUUID());
        template.setName("Promotion Quest");
        template.setCreatedBy("user1");
        template.setCreatedAt(LocalDateTime.now().minusMinutes(30));

        when(templateRepository.findByRequestedForGlobalTrueAndGlobalFalse()).thenReturn(List.of(template));

        // Act
        DashboardStatsResponse stats = dashboardService.getDashboardStats("7d");

        // Assert
        assertEquals(1, stats.getPromotionRequests().size());
        assertEquals("user1", stats.getPromotionRequests().get(0).getRequester());
    }

    @Test
    void fetchActivities_ShouldHandleRegularAdmin() {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        Form recentForm = new Form();
        recentForm.setId(UUID.randomUUID());
        recentForm.setName("New Form");
        recentForm.setCreatedAt(LocalDateTime.now().minusMinutes(5));

        when(formRepository.findTop5ByCreatedByOrderByCreatedAtDesc(anyString())).thenReturn(List.of(recentForm));

        // Act
        DashboardStatsResponse stats = dashboardService.getDashboardStats("7d");

        // Assert
        assertFalse(stats.getRecentActivity().isEmpty());
    }

    @Test
    void calculateTimeLeft_ShouldReturnMinutes_WhenLessThanOneHour() {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        Form expiringForm = new Form();
        expiringForm.setId(UUID.randomUUID());
        expiringForm.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        expiringForm.setCreatedAt(LocalDateTime.now().minusDays(1));

        when(formRepository.findAllByCreatedByAndExpiresAtBetweenOrderByExpiresAtAsc(anyString(), any(), any()))
                .thenReturn(List.of(expiringForm));

        // Act
        DashboardStatsResponse stats = dashboardService.getDashboardStats("7d");

        // Assert
        String timeLeft = stats.getExpiringForms().get(0).getTimeLeft();
        assertTrue(timeLeft.contains("m"), "Time left should be in minutes");
    }

    @Test
    void calculateTimeLeft_ShouldReturnZeroMinutes_WhenDurationIsInvalid() {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        Form expiringForm = new Form();
        expiringForm.setId(UUID.randomUUID());
        expiringForm.setExpiresAt(LocalDateTime.now().minusMinutes(5)); // Already expired
        expiringForm.setCreatedAt(LocalDateTime.now().minusDays(1));

        when(formRepository.findAllByCreatedByAndExpiresAtBetweenOrderByExpiresAtAsc(anyString(), any(), any()))
                .thenReturn(List.of(expiringForm));

        // Act
        DashboardStatsResponse stats = dashboardService.getDashboardStats("7d");

        // Assert
        assertEquals("0m", stats.getExpiringForms().get(0).getTimeLeft());
    }

    @Test
    void getDashboardStats_ShouldHandleZeroForms_ForAvgCalculation() {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        when(formRepository.countByCreatedBy("testuser")).thenReturn(0L);

        // Act
        DashboardStatsResponse stats = dashboardService.getDashboardStats("7d");

        // Assert
        assertEquals(0.0, stats.getAvgResponsesPerForm(), "Avg should be 0 when no forms exist");
    }

    @Test
    void fetchActivities_ShouldSortInterleavedEntities() {
        // Arrange
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        LocalDateTime now = LocalDateTime.now();
        Form oldForm = new Form();
        oldForm.setId(UUID.randomUUID());
        oldForm.setName("Old");
        oldForm.setCreatedAt(now.minusHours(2));
        
        com.formcraft.entity.FormResponse newResponse = new com.formcraft.entity.FormResponse();
        newResponse.setId(UUID.randomUUID());
        newResponse.setCreatedAt(now.minusHours(1));
        newResponse.setForm(Form.builder().name("Target").build());

        when(formRepository.findTop5ByCreatedByOrderByCreatedAtDesc(anyString())).thenReturn(List.of(oldForm));
        when(formResponseRepository.findTop5ByFormCreatedByOrderByCreatedAtDesc(anyString())).thenReturn(List.of(newResponse));

        // Act
        DashboardStatsResponse stats = dashboardService.getDashboardStats("7d");

        // Assert: Response is newer, should be first
        assertEquals("RESPONSE_RECEIVED", stats.getRecentActivity().get(0).getType());
        assertEquals("FORM_CREATED", stats.getRecentActivity().get(1).getType());
    }

    @Test
    void getTimeAgo_ShouldHandleNull() {
        // This targets the internal getTimeAgo logic via fetchActivities
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);

        Form nullTimeForm = new Form();
        nullTimeForm.setId(UUID.randomUUID());
        nullTimeForm.setCreatedAt(null); // Explicit null

        when(formRepository.findTop5ByCreatedByOrderByCreatedAtDesc(anyString())).thenReturn(List.of(nullTimeForm));

        // Act
        DashboardStatsResponse stats = dashboardService.getDashboardStats("7d");

        // Assert
        assertEquals("Just now", stats.getRecentActivity().get(0).getTimeAgo());
    }
}
