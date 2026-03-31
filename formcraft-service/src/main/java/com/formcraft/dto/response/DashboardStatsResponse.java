package com.formcraft.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@io.swagger.v3.oas.annotations.media.Schema(description = "An overview of stats for your dashboard.")
public class DashboardStatsResponse {
    @io.swagger.v3.oas.annotations.media.Schema(description = "The total number of forms you've created.")
    private long totalForms;

    @io.swagger.v3.oas.annotations.media.Schema(description = "The number of architectural drafts currently in progress.")
    private long totalDrafts;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The number of forms currently open for answers.")
    private long activeForms;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The number of responses received in the last 24 hours.")
    private long responsesLast24h;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The number of forms scheduled to expire within the next 48 hours.")
    private long expiringSoon; 
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The average number of answers each form gets.")
    private double avgResponsesPerForm;
    @io.swagger.v3.oas.annotations.media.Schema(description = "Data used to draw the activity charts.")
    private List<ChartData> chartData;
    @io.swagger.v3.oas.annotations.media.Schema(description = "A record of a single recent activity.")
    private List<RecentActivity> recentActivity;

    @io.swagger.v3.oas.annotations.media.Schema(description = "A list of forms expiring within the next 24 hours.")
    private List<ExpiringForm> expiringForms;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Super Admin: Total number of global/certified templates.")
    private long totalTemplates;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Super Admin: Number of templates pending for global promotion.")
    private long pendingPromotions;

    @io.swagger.v3.oas.annotations.media.Schema(description = "Super Admin: A list of templates awaiting global certification.")
    private List<PromotionRequest> promotionRequests;

    @Data
    @Builder
    public static class ExpiringForm {
        private String id;
        private String name;
        private String timeLeft;
        private java.time.LocalDateTime expiresAt;
    }

    @Data
    @Builder
    public static class PromotionRequest {
        private String id;
        private String name;
        private String requester;
        private String timeAgo;
    }

    @Data
    @Builder
    @io.swagger.v3.oas.annotations.media.Schema(description = "A single point of data for a chart.")
    public static class ChartData {
        private String date;
        private long count;
    }

    @Data
    @Builder
    @io.swagger.v3.oas.annotations.media.Schema(description = "A record of a single recent activity.")
    public static class RecentActivity {
        private String id;
        private String type; // FORM_CREATED, RESPONSE_RECEIVED
        private String title;
        private String description;
        private String timeAgo;
        private java.time.LocalDateTime timestamp;
    }
}
