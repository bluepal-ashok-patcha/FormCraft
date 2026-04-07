package com.formcraft.util;

import com.formcraft.entity.FormResponse;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CsvHelperTest {

    @Test
    void responsesToCsv_ShouldReturnValidBytes_WhenDataProvided() {
        // Arrange
        FormResponse response = new FormResponse();
        response.setId(UUID.randomUUID());
        response.setResponseData(Map.of("field1", "Value 1", "field2", "Value with \"quotes\""));

        List<Map<String, Object>> fields = List.of(
                Map.of("id", "field1", "label", "Field One"),
                Map.of("id", "field2", "label", "Field Two")
        );

        // Act
        byte[] csvBytes = CsvHelper.responsesToCsv(List.of(response), fields);
        String csv = new String(csvBytes);

        // Assert
        assertTrue(csv.contains("Field One"));
        assertTrue(csv.contains("Field Two"));
        assertTrue(csv.contains("Value 1"));
        assertTrue(csv.contains("Value with \"\"quotes\"\"")); // Escaped
    }

    @Test
    void responsesToCsv_ShouldJoinLists_WhenValueIsList() {
        // Arrange
        FormResponse response = new FormResponse();
        response.setId(UUID.randomUUID());
        response.setResponseData(Map.of("field1", List.of("A", "B", "C")));

        List<Map<String, Object>> fields = List.of(Map.of("id", "field1", "label", "List Field"));

        // Act
        byte[] csvBytes = CsvHelper.responsesToCsv(List.of(response), fields);
        String csv = new String(csvBytes);

        // Assert
        assertTrue(csv.contains("A; B; C"));
    }

    @Test
    void responsesToCsv_ShouldApplyExcelGuard_WhenValueIsPhoneNumber() {
        // Arrange
        FormResponse response = new FormResponse();
        response.setId(UUID.randomUUID());
        response.setResponseData(Map.of("field1", "1234567890"));

        List<Map<String, Object>> fields = List.of(Map.of("id", "field1", "label", "Phone"));

        // Act
        byte[] csvBytes = CsvHelper.responsesToCsv(List.of(response), fields);
        String csv = new String(csvBytes);

        // Assert
        assertTrue(csv.contains("\t1234567890")); // Expect tab guard
    }

    @Test
    void responsesToCsv_WithAnalytics_ShouldIncludeFooter() {
        // Arrange
        FormResponse response = new FormResponse();
        response.setId(UUID.randomUUID());
        
        List<Map<String, Object>> fields = List.of(Map.of("id", "q1", "label", "Question 1"));
        Map<String, Object> analytics = Map.of("q1", Map.of(
            "label", "Question 1",
            "topAnswer", "Excel Boss",
            "totalResponses", 100
        ));

        // Act
        byte[] csvBytes = CsvHelper.responsesToCsv(List.of(response), fields, analytics);
        String csv = new String(csvBytes);

        // Assert
        assertTrue(csv.contains("-- ANALYTICS BREAKDOWN --"));
        assertTrue(csv.contains("Question 1"));
        assertTrue(csv.contains("Excel Boss"));
        assertTrue(csv.contains("100"));
    }

    @Test
    void responsesToCsv_ShouldReturnEmpty_WhenNoResponses() {
        // Arrange
        List<Map<String, Object>> fields = List.of(Map.of("id", "f1", "label", "L1"));

        // Act
        byte[] csvBytes = CsvHelper.responsesToCsv(List.of(), fields);
        String csv = new String(csvBytes);

        // Assert
        assertTrue(csv.startsWith("Response ID,Date Submitted,"));
        assertEquals(1, csv.split("\n").length); // Only header
    }

    @Test
    void constructor_ShouldThrowException_WhenCalled() throws NoSuchMethodException {
        // Arrange
        Constructor<CsvHelper> constructor = CsvHelper.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        // Act & Assert
        assertThrows(InvocationTargetException.class, constructor::newInstance);
    }
}
