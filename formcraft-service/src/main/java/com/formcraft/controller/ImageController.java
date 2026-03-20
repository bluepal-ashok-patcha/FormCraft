package com.formcraft.controller;

import com.formcraft.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Visual Asset Protocol", description = "Management services for high-fidelity form imagery and storage orchestration.")
public class ImageController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<com.formcraft.dto.response.ApiResponse<java.util.Map<String, String>>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(com.formcraft.dto.response.ApiResponse.success(java.util.Map.of("url", url), "Visual asset successfully synchronized."));
    }
}
