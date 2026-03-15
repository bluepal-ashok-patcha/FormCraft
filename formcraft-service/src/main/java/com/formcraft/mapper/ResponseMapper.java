package com.formcraft.mapper;

import com.formcraft.dto.response.ResponseDto;
import com.formcraft.entity.FormResponse;
import org.springframework.stereotype.Component;

@Component
public class ResponseMapper {

    public ResponseDto toDto(FormResponse entity) {
        return ResponseDto.builder()
                .id(entity.getId())
                .formId(entity.getForm().getId())
                .responseData(entity.getResponseData())
                .submittedAt(entity.getCreatedAt())
                .build();
    }
}
