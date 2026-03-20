package com.formcraft.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@io.swagger.v3.oas.annotations.media.Schema(description = "Executive Statistics Blueprint: A high-fidelity data summary of the platform's strategic metrics.")
public class DashboardStatsResponse {
    @io.swagger.v3.oas.annotations.media.Schema(description = "Total count of form architectures preserved in the registry.")
    private long totalForms;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Aggregate count of all gathered strategic responses.")
    private long totalResponses;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Current number of forms that are actively gathering data.")
    private long activeForms;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Precise count of responses synchronized within the last 24-hour cycle.")
    private long responsesToday;
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Efficiency percentage: the rate of link-to-submission conversion.")
    private double submissionRate; 
    
    @io.swagger.v3.oas.annotations.media.Schema(description = "Baseline average of responses per form blueprint.")
    private double avgResponsesPerForm;
    @io.swagger.v3.oas.annotations.media.Schema(description = "Mission Activity Map: Chronological data for visual metrics.")
    private List<ChartData> chartData;
    @io.swagger.v3.oas.annotations.media.Schema(description = "Real-time log of the latest identity and architecture events.")
    private List<RecentActivity> recentActivity;

    @Data
    @Builder
    @io.swagger.v3.oas.annotations.media.Schema(description = "Chronological Data Point for metric visualization.")
    public static class ChartData {
        private String date;
        private long count;
    }

    @Data
    @Builder
    @io.swagger.v3.oas.annotations.media.Schema(description = "Real-time activity log entry.")
    public static class RecentActivity {
        private String id;
        private String type; // FORM_CREATED, RESPONSE_RECEIVED
        private String title;
        private String description;
        private String timeAgo;
        private java.time.LocalDateTime timestamp;
    }
}
