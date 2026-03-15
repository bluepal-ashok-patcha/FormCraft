package com.formcraft.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalForms;
    private long totalResponses;
    private long activeForms;
    private long responsesToday;
    private double submissionRate; 
    private double avgResponsesPerForm;
    private List<ChartData> chartData;
    private List<RecentActivity> recentActivity;

    @Data
    @Builder
    public static class ChartData {
        private String date;
        private long count;
    }

    @Data
    @Builder
    public static class RecentActivity {
        private String id;
        private String type; // FORM_CREATED, RESPONSE_RECEIVED
        private String title;
        private String description;
        private String timeAgo;
        private java.time.LocalDateTime timestamp;
    }
}
