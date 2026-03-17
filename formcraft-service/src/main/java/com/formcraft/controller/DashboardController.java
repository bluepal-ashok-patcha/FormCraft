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

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats(
            @RequestParam(name = "range", required = false, defaultValue = "7d") String range) {
        DashboardStatsResponse stats = dashboardService.getDashboardStats(range);
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics fetched successfully"));
    }
}
