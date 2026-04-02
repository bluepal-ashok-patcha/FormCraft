package com.formcraft.util;

import com.formcraft.entity.FormResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CsvHelper {

    private static final String CSV_DELIMITER = ",";
    private static final String CSV_QUOTE = "\"";
    private static final String CSV_ESCAPE = "\"\"";

    private CsvHelper() {
        throw new IllegalStateException("Utility class");
    }

    public static byte[] responsesToCsv(List<FormResponse> responses, List<Map<String, Object>> fields) {
        StringBuilder csv = new StringBuilder();
        
        appendHeader(csv, fields);
        
        for (FormResponse response : responses) {
            appendResponseRow(csv, response, fields);
            csv.append("\n");
        }
        
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static void appendHeader(StringBuilder csv, List<Map<String, Object>> fields) {
        csv.append("Response ID,Date Submitted");
        for (Map<String, Object> field : fields) {
            String label = (String) field.get("label");
            csv.append(CSV_DELIMITER).append(CSV_QUOTE).append(escapeQuotes(label)).append(CSV_QUOTE);
        }
        csv.append("\n");
    }

    private static void appendResponseRow(StringBuilder csv, FormResponse response, List<Map<String, Object>> fields) {
        csv.append(response.getId()).append(CSV_DELIMITER).append(response.getCreatedAt());
        
        Map<String, Object> responseData = response.getResponseData();
        for (Map<String, Object> field : fields) {
            String id = field.containsKey("id") ? (String) field.get("id") : (String) field.get("label");
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
