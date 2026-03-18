package com.formcraft.mapper;

import com.formcraft.dto.request.FormRequest;
import com.formcraft.dto.response.FormDto;
import com.formcraft.entity.Form;
import org.springframework.stereotype.Component;

@Component
public class FormMapper {

    public Form toEntity(FormRequest request) {
        return Form.builder()
                .name(request.getName())
                .slug(null) // Added based on the provided snippet
                .schema(request.getSchema())
                .startsAt(request.getStartsAt()) // Added based on the provided snippet
                .expiresAt(request.getExpiresAt()) // Added based on the provided snippet
                .bannerUrl(request.getBannerUrl())
                .themeColor(request.getThemeColor())
                .build();
    }

    public FormDto toDto(Form entity) {
        return FormDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .schema(entity.getSchema())
                .status(entity.getStatus())
                .startsAt(entity.getStartsAt()) // Added based on the provided snippet
                .expiresAt(entity.getExpiresAt())
                .createdAt(entity.getCreatedAt())
                .responseCount(0) // Default to 0, service can populate
                .bannerUrl(entity.getBannerUrl())
                .themeColor(entity.getThemeColor())
                .build();
    }
}
