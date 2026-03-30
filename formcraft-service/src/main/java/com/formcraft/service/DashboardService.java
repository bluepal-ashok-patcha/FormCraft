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

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(String range) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isSuperAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        long totalForms = isSuperAdmin ? formRepository.count() : formRepository.countByCreatedBy(username);
        long totalDrafts = isSuperAdmin ? formDraftRepository.count() : formDraftRepository.countByCreatedBy(username);
        long activeForms = isSuperAdmin ? formRepository.countByStatus(com.formcraft.enums.FormStatus.ACTIVE) : formRepository.countByCreatedByAndStatus(username, com.formcraft.enums.FormStatus.ACTIVE);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrowAfter = now.plusHours(48);
        long expiringSoon = isSuperAdmin ? formRepository.countByExpiresAtBetween(now, tomorrowAfter) : formRepository.countByCreatedByAndExpiresAtBetween(username, now, tomorrowAfter);

        LocalDateTime startOfLast24h = LocalDateTime.now().minusHours(24);
        long responsesLast24h = isSuperAdmin ? formResponseRepository.countByCreatedAtGreaterThanEqual(startOfLast24h) : formResponseRepository.countByFormCreatedByAndCreatedAtGreaterThanEqual(username, startOfLast24h);
        
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
                
        return DashboardStatsResponse.builder()
                .totalForms(totalForms)
                .totalDrafts(totalDrafts)
                .activeForms(activeForms)
                .responsesLast24h(responsesLast24h)
                .expiringSoon(expiringSoon)
                .avgResponsesPerForm(avgResponses)
                .recentActivity(activities.stream().limit(5).collect(Collectors.toList()))
                .chartData(chartData)
                .build();
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        // Simple implementation
        return dateTime.format(DateTimeFormatter.ofPattern("HH:mm"));
    }
}
