package com.formcraft.controller;

import com.formcraft.dto.response.DashboardStatsResponse;
import com.formcraft.dto.response.ApiResponse;
import com.formcraft.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard Statistics", description = "Get an overview of form activity and data.")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Get overview statistics", description = "View charts and numbers about form creation and responses.")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats(
            @Parameter(description = "Time range for stats (e.g., 7d, 30d)") @RequestParam(name = "range", required = false, defaultValue = "7d") String range) {
        DashboardStatsResponse stats = dashboardService.getDashboardStats(range);
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics fetched successfully"));
    }
}
