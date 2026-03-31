package com.formcraft.controller;

import com.formcraft.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

@Slf4j
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Tag(name = "Images", description = "Upload and manage pictures for your forms.")
public class ImageController {

    private final CloudinaryService cloudinaryService;

    @Operation(summary = "Upload a picture", description = "Send an image file to be used in your form designs.")
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<com.formcraft.dto.response.ApiResponse<java.util.Map<String, String>>> uploadImage(@Parameter(description = "The image file you want to upload") @RequestParam("file") MultipartFile file) {
        log.info("Visual Asset Protocol: Initiating upload for file '{}' ({})", file.getOriginalFilename(), file.getSize());
        String url = cloudinaryService.uploadFile(file);
        log.info("Visual Asset Synchronized: Upload complete. Resource URL: {}", url);
        return ResponseEntity.ok(com.formcraft.dto.response.ApiResponse.success(java.util.Map.of("url", url), "Visual asset successfully synchronized."));
    }
}
