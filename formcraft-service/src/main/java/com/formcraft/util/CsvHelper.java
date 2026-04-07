package com.formcraft.util;

import com.formcraft.entity.FormResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Utility class for generating CSV exports from form responses.
 * Follows industry-standard CSV formatting and specialized Excel compatibility guards.
 */
public class CsvHelper {

    private static final String CSV_DELIMITER = ",";
    private static final String CSV_QUOTE = "\"";
    private static final String CSV_ESCAPE = "\"\"";
    private static final String LABEL_KEY = "label"; // SonarQube Compliance: Constant definition

    private CsvHelper() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Legacy support for standard exports.
     */
    public static byte[] responsesToCsv(List<FormResponse> responses, List<Map<String, Object>> fields) {
        return responsesToCsv(responses, fields, null);
    }

    /**
     * Main export method that generates a combined CSV with raw data and an analytics summary footer.
     */
    @SuppressWarnings("unchecked")
    public static byte[] responsesToCsv(List<FormResponse> responses, List<Map<String, Object>> fields, Map<String, Object> analytics) {
        StringBuilder csv = new StringBuilder();
        
        // 1. Raw Data Header & Rows
        appendHeader(csv, fields);
        for (FormResponse response : responses) {
            appendResponseRow(csv, response, fields);
            csv.append("\n");
        }

        // 2. Analytics Breakdown Section (Optional Footer)
        if (analytics != null && !analytics.isEmpty()) {
            csv.append("\n\n").append(CSV_QUOTE).append("-- ANALYTICS BREAKDOWN --").append(CSV_QUOTE).append("\n");
            csv.append("Question ID").append(CSV_DELIMITER)
               .append("Label").append(CSV_DELIMITER)
               .append("Top Achievement").append(CSV_DELIMITER)
               .append("Total Responses").append("\n");

            for (Map.Entry<String, Object> entry : analytics.entrySet()) {
                Map<String, Object> stats = (Map<String, Object>) entry.getValue();
                csv.append(CSV_QUOTE).append(escapeQuotes(entry.getKey())).append(CSV_QUOTE).append(CSV_DELIMITER)
                   .append(CSV_QUOTE).append(escapeQuotes((String) stats.get(LABEL_KEY))).append(CSV_QUOTE).append(CSV_DELIMITER)
                   .append(CSV_QUOTE).append(escapeQuotes(String.valueOf(stats.getOrDefault("topAnswer", "N/A")))).append(CSV_QUOTE).append(CSV_DELIMITER)
                   .append(stats.getOrDefault("totalResponses", 0)).append("\n");
            }
        }
        
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static void appendHeader(StringBuilder csv, List<Map<String, Object>> fields) {
        csv.append("Response ID,Date Submitted");
        for (Map<String, Object> field : fields) {
            String label = (String) field.get(LABEL_KEY);
            csv.append(CSV_DELIMITER).append(CSV_QUOTE).append(escapeQuotes(label)).append(CSV_QUOTE);
        }
        csv.append("\n");
    }

    private static void appendResponseRow(StringBuilder csv, FormResponse response, List<Map<String, Object>> fields) {
        csv.append(response.getId()).append(CSV_DELIMITER).append(response.getCreatedAt());
        
        Map<String, Object> responseData = response.getResponseData();
        for (Map<String, Object> field : fields) {
            String id = field.containsKey("id") ? (String) field.get("id") : (String) field.get(LABEL_KEY);
            Object value = responseData != null ? responseData.get(id) : null;
            
            String valStr = formatFieldValue(value);
            valStr = applyExcelNumericGuard(valStr);
            
            csv.append(CSV_DELIMITER).append(CSV_QUOTE).append(escapeQuotes(valStr)).append(CSV_QUOTE);
        }
    }

    private static String formatFieldValue(Object value) {
        if (value == null) {
            return "";
        }
        
        if (value instanceof List) {
            return ((List<?>) value).stream()
                    .map(Object::toString)
                    .collect(Collectors.joining("; "));
        }
        
        return value.toString();
    }

    private static String applyExcelNumericGuard(String valStr) {
        // Fix for Excel converting big numbers (like phone numbers) into scientific notation.
        // Prepend tab so excel treats as literal string
        if (valStr.matches("^\\+?[0-9\\s\\-()]{8,20}$") && valStr.matches(".*\\d.*")) {
            return "\t" + valStr;
        }
        return valStr;
    }

    private static String escapeQuotes(String input) {
        if (input == null) return "";
        return input.replace(CSV_QUOTE, CSV_ESCAPE);
    }
}
