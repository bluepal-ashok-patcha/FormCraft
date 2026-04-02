package com.formcraft.util;

import com.formcraft.entity.FormResponse;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CsvHelperTest {

    @Test
    void responsesToCsv_ShouldGenerateValidCsv() {
        // Setup schema fields
        List<Map<String, Object>> fields = List.of(
            Map.of("label", "Full Name"),
            Map.of("label", "Phone Number"),
            Map.of("label", "Interests")
        );

        // Setup responses
        UUID responseId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        
        FormResponse response = FormResponse.builder()
                .id(responseId)
                .responseData(Map.of(
                    "Full Name", "John \"The Legend\" Doe",
                    "Phone Number", "+1234567890123", // Should trigger Excel guard
                    "Interests", List.of("Coding", "Testing")
                ))
                .build();
        response.setCreatedAt(now);

        List<FormResponse> responses = List.of(response);

        // Execute
        byte[] csvBytes = CsvHelper.responsesToCsv(responses, fields);
        String csvContent = new String(csvBytes);

        // Assertions
        assertNotNull(csvBytes);
        assertTrue(csvContent.contains("Response ID,Date Submitted,\"Full Name\",\"Phone Number\",\"Interests\""));
        assertTrue(csvContent.contains(responseId.toString()));
        assertTrue(csvContent.contains("John \"\"The Legend\"\" Doe")); // Quote escaping check
        assertTrue(csvContent.contains("\t+1234567890123")); // Excel guard check
        assertTrue(csvContent.contains("Coding; Testing")); // List formatting check
    }

    @Test
    void responsesToCsv_WithEmptyData_ShouldHandleGracefully() {
        List<Map<String, Object>> fields = List.of(Map.of("label", "Name"));
        FormResponse emptyResponse = FormResponse.builder()
                .id(UUID.randomUUID())
                .responseData(null) // Null response data
                .build();
        emptyResponse.setCreatedAt(LocalDateTime.now());
        List<FormResponse> responses = List.of(emptyResponse);

        byte[] csvBytes = CsvHelper.responsesToCsv(responses, fields);
        String csvContent = new String(csvBytes);

        assertTrue(csvContent.contains(",\"\"")); // Empty field check
    }

    @Test
    void responsesToCsv_ShouldSupportIdToLabelMapping() {
        // High-Fidelity Sync: Schema uses 'id', Response uses 'id', CSV Header uses 'label'
        List<Map<String, Object>> fields = List.of(
            Map.of("id", "f1", "label", "Full Name")
        );
        
        FormResponse response = FormResponse.builder()
                .id(UUID.randomUUID())
                .responseData(Map.of("f1", "John Doe"))
                .build();
        response.setCreatedAt(LocalDateTime.now());

        byte[] csvBytes = CsvHelper.responsesToCsv(List.of(response), fields);
        String csvContent = new String(csvBytes);

        assertTrue(csvContent.contains("\"Full Name\"")); // Header check
        assertTrue(csvContent.contains("\"John Doe\"")); // Data check
    }
}
