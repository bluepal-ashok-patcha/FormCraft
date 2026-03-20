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
@io.swagger.v3.oas.annotations.tags.Tag(name = "Executive Operations Dashboard", description = "Protocols for real-time strategic intelligence and enterprise-wide data metrics.")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats(
            @RequestParam(name = "range", required = false, defaultValue = "7d") String range) {
        DashboardStatsResponse stats = dashboardService.getDashboardStats(range);
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics fetched successfully"));
    }
}
