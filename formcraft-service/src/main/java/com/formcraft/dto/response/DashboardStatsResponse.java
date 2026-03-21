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
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The total number of responses your forms have received.")
    private long totalResponses;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The number of forms currently open for answers.")
    private long activeForms;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The number of responses received in the last 24 hours.")
    private long responsesToday;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The percentage of people who started a form and finished it.")
    private double submissionRate; 
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "The average number of answers each form gets.")
    private double avgResponsesPerForm;
    @io.swagger.v3.oas.annotations.media.Schema(description = "Data used to draw the activity charts.")
    private List<ChartData> chartData;
    @io.swagger.v3.oas.annotations.media.Schema(description = "A list of the most recent things that happened.")
    private List<RecentActivity> recentActivity;

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
