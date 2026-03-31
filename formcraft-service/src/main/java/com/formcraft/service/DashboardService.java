package com.formcraft.service;

import com.formcraft.dto.response.DashboardStatsResponse;
import com.formcraft.entity.Form;
import com.formcraft.entity.FormResponse;
import com.formcraft.repository.FormRepository;
import com.formcraft.repository.FormResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FormRepository formRepository;
    private final FormResponseRepository formResponseRepository;
    private final com.formcraft.repository.builder.FormDraftRepository formDraftRepository;
    private final com.formcraft.repository.TemplateRepository templateRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(String range) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isSuperAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        long totalForms = isSuperAdmin ? formRepository.count() : formRepository.countByCreatedBy(username);
        long totalDrafts = isSuperAdmin ? formDraftRepository.count() : formDraftRepository.countByCreatedBy(username);
        long activeForms = isSuperAdmin ? formRepository.countByStatus(com.formcraft.enums.FormStatus.ACTIVE) : formRepository.countByCreatedByAndStatus(username, com.formcraft.enums.FormStatus.ACTIVE);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusHours(24);
        long expiringSoon = isSuperAdmin ? formRepository.countByExpiresAtBetween(now, tomorrow) : formRepository.countByCreatedByAndExpiresAtBetween(username, now, tomorrow);

        LocalDateTime startOfLast24h = LocalDateTime.now().minusHours(24);
        long responsesLast24h = isSuperAdmin ? formResponseRepository.countByCreatedAtGreaterThanEqual(startOfLast24h) : formResponseRepository.countByFormCreatedByAndCreatedAtGreaterThanEqual(username, startOfLast24h);
        
        long totalTemplates = isSuperAdmin ? templateRepository.countByGlobal(true) : 0;
        long pendingPromotions = isSuperAdmin ? templateRepository.countByRequestedForGlobalTrueAndGlobalFalse() : 0;
        
        double avgResponses = totalForms > 0 ? (double) (isSuperAdmin ? formResponseRepository.count() : formResponseRepository.countByFormCreatedBy(username)) / totalForms : 0;
        
        // Recently created forms
        List<Form> recentForms = isSuperAdmin ? formRepository.findTop5ByOrderByCreatedAtDesc() : formRepository.findTop5ByCreatedByOrderByCreatedAtDesc(username);
        // Recent responses
        List<FormResponse> recentResponses = isSuperAdmin ? formResponseRepository.findTop5ByOrderByCreatedAtDesc() : formResponseRepository.findTop5ByFormCreatedByOrderByCreatedAtDesc(username);
        
        List<DashboardStatsResponse.RecentActivity> activities = new ArrayList<>();
        
        recentForms.forEach(f -> activities.add(DashboardStatsResponse.RecentActivity.builder()
                .id(f.getId().toString())
                .type("FORM_CREATED")
                .title("New Form Created")
                .description("You created " + f.getName())
                .timeAgo(getTimeAgo(f.getCreatedAt()))
                .timestamp(f.getCreatedAt())
                .build()));
                
        recentResponses.forEach(r -> activities.add(DashboardStatsResponse.RecentActivity.builder()
                .id(r.getId().toString())
                .type("RESPONSE_RECEIVED")
                .title("New Response")
                .description("Someone responded to " + r.getForm().getName())
                .timeAgo(getTimeAgo(r.getCreatedAt()))
                .timestamp(r.getCreatedAt())
                .build()));
                
        activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        
        // Chart Data based on range
        int days = switch (range != null ? range.toLowerCase() : "") {
            case "30d" -> 30;
            case "90d" -> 90;
            default -> 7;
        };
        
        LocalDateTime rangeStart = LocalDateTime.now().minusDays(days);
        List<Object[]> stats = isSuperAdmin ? formResponseRepository.findGlobalResponseStats(rangeStart) : formResponseRepository.findResponseStatsByCreatedBy(username, rangeStart);
        
        List<DashboardStatsResponse.ChartData> chartData = stats.stream()
                .map(s -> DashboardStatsResponse.ChartData.builder()
                        .date(s[0].toString())
                        .count(((Number) s[1]).longValue())
                        .build())
                .collect(Collectors.toList());
                
        // Expiring forms list
        List<Form> expiringSoonForms = isSuperAdmin ? formRepository.findAllByExpiresAtBetweenOrderByExpiresAtAsc(now, tomorrow) : formRepository.findAllByCreatedByAndExpiresAtBetweenOrderByExpiresAtAsc(username, now, tomorrow);
        
        List<DashboardStatsResponse.ExpiringForm> expiringForms = expiringSoonForms.stream()
                .map(f -> DashboardStatsResponse.ExpiringForm.builder()
                        .id(f.getId().toString())
                        .name(f.getName())
                        .timeLeft(calculateTimeLeft(f.getExpiresAt()))
                        .expiresAt(f.getExpiresAt())
                        .build())
                .collect(Collectors.toList());

        // Promotion requests for super admin
        List<DashboardStatsResponse.PromotionRequest> promotionRequests = new java.util.ArrayList<>();
        if (isSuperAdmin) {
            promotionRequests = templateRepository.findByRequestedForGlobalTrueAndGlobalFalse().stream()
                .map(t -> DashboardStatsResponse.PromotionRequest.builder()
                        .id(t.getId().toString())
                        .name(t.getName())
                        .requester(t.getCreatedBy())
                        .timeAgo(getTimeAgo(t.getCreatedAt()))
                        .build())
                .collect(Collectors.toList());
        }

        return DashboardStatsResponse.builder()
                .totalForms(totalForms)
                .totalDrafts(totalDrafts)
                .activeForms(activeForms)
                .responsesLast24h(responsesLast24h)
                .expiringSoon(expiringSoon)
                .totalTemplates(totalTemplates)
                .pendingPromotions(pendingPromotions)
                .avgResponsesPerForm(avgResponses)
                .recentActivity(activities.stream().limit(5).collect(Collectors.toList()))
                .expiringForms(expiringForms)
                .promotionRequests(promotionRequests)
                .chartData(chartData)
                .build();
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        return dateTime.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private String calculateTimeLeft(LocalDateTime expiresAt) {
        if (expiresAt == null) return "Unknown";
        java.time.Duration duration = java.time.Duration.between(LocalDateTime.now(), expiresAt);
        long hours = duration.toHours();
        if (hours > 0) return hours + "h";
        long minutes = duration.toMinutes();
        return (minutes > 0 ? minutes : 0) + "m";
    }
}
